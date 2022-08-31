const vm = new Vue({
  el: "#app",
  data: {
    produtos: {},
    produto: false,
    carrinho: [],
    mensagemAlerta: "Item adicionado",
    alertaAtivo: false,
    carrinhoAtivo: true,
  },
  computed: {
    carrinhoTotal() {
      let total = 0;
      if (this.carrinho.length) {
        total = this.carrinho.reduce((acc, { preco }) => acc + preco, 0);
      }
      return total;
    },
  },
  methods: {
    async fetchProdutos() {
      const response = await fetch("./api/produtos.json");
      const json = await response.json();
      this.produtos = json;
    },
    async fetchProduto(id) {
      const response = await fetch(`./api/produtos/${id}/dados.json`);
      const json = await response.json();
      this.produto = json;
    },
    abrirModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    fecharModal({ target, currentTarget }) {
      if (currentTarget === target) this.produto = false;
    },
    clickForaCarrinho({ target, currentTarget }) {
      if (currentTarget === target) this.carrinhoAtivo = false;
    },
    adicionarItem() {
      this.produto.estoque--;
      const { id, nome, preco } = this.produto;
      this.carrinho.push({ id, nome, preco });
      this.alerta(`${nome} foi adicionado ao carrinho!`);
    },
    removerItem(index) {
      this.carrinho.splice(index, 1);
    },
    checarLocalStorage() {
      const carrinho = window.localStorage.getItem("carrinho");
      if (carrinho) this.carrinho = JSON.parse(carrinho);
    },
    compararEstoque() {
      const qtdProdutosNoCarrinho = this.carrinho.filter(({id}) => id === this.produto.id).length;
      this.produto.estoque -= qtdProdutosNoCarrinho;
    },
    alerta(mensagem) {
      this.mensagemAlerta = mensagem;
      this.alertaAtivo = true;
      setTimeout(() => {
        this.alertaAtivo = false;
      }, 1500);
    },
    router() {
      const hash = document.location.hash;
      if (hash) {
        this.fetchProduto(hash.replace("#", ""));
      }
    },
  },
  filters: {
    numeroPreco(valor) {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  watch: {
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho);
    },
    produto() {
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id ? "#" + this.produto.id : " ";
      history.pushState(null, null, hash);
      if(this.produto) {
        this.compararEstoque();
      }
    },
  },
  created() {
    this.fetchProdutos();
    this.router();
    this.checarLocalStorage();
  },
});
