import { callApi } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const name = document.getElementById("name").value.trim();
    const lastName = document.getElementById("lastName").value.trim();

    // Validação de senha
    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!validarSenha(password)) {
      alert("A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos.");
      return;
    }

    const payload = { email, password, name, lastName };

    try {
      const response = await callApi({
        url:"/auth/register",
        method: "POST",
        body: payload
    });
    
      alert("Cadastro realizado com sucesso!");
      window.location.href = "Login.html";
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao cadastrar: " + error.message);
    }
  });
});

function validarSenha(senha) {
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temSimbolo = /[^A-Za-z0-9]/.test(senha);
  return senha.length >= 8 && temMaiuscula && temMinuscula && temNumero && temSimbolo;
}
