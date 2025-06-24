import { callApi } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  // ============ TEXTO ANIMADO ============
  const typedTextSpan = document.querySelector(".texto-animado");
  if (typedTextSpan) {
    const textArray = ["em cada Solicitação", "em cada Chamado", "É Charles²"];
    const typingDelay = 100;
    const erasingDelay = 150;
    const newTextDelay = 1000;
    let textArrayIndex = 0;
    let charIndex = 0;

    function type() {
      if (charIndex < textArray[textArrayIndex].length) {
        typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);
      } else {
        setTimeout(erase, newTextDelay);
      }
    }

    function erase() {
      if (charIndex > 0) {
        typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingDelay);
      } else {
        textArrayIndex++;
        if (textArrayIndex >= textArray.length) textArrayIndex = 0;
        setTimeout(type, typingDelay + 500);
      }
    }

    function init() {
      typedTextSpan.textContent = textArray[textArrayIndex];
      charIndex = textArray[textArrayIndex].length;
      setTimeout(erase, newTextDelay);
    }

    init();
  }

  // ============ REQUISIÇÃO DE CONTATO ============
  const contactForm = document.querySelector(".contato form");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("nome").value.trim();
      const phone = document.getElementById("telefone").value.trim();
      const email = document.getElementById("email").value.trim();
      const city = document.getElementById("cidade").value.trim();
      const message = document.getElementById("mensagem").value.trim();
      const tipoPlano = document.querySelector('input[name="tipo_plano"]:checked')?.value.toUpperCase();

      if (!name || !email || !message || !phone || !tipoPlano) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      const payload = {
        name,
        phone,
        email,
        city,
        personType: tipoPlano,
        message
      };

      try {
        const resposta = await callApi({
          url: "/contactRequest/send",
          method: "POST",
          body: payload
        });

        alert("Contato enviado com sucesso! Em breve retornaremos.");
        contactForm.reset();
      } catch (error) {
        console.error("Erro ao enviar contato:", error);
      }
    });
  }

  // ============ FORMULÁRIO DE CADASTRO ============
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
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
          url: "/auth/register",
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
  }

  function validarSenha(senha) {
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);
    const temSimbolo = /[^A-Za-z0-9]/.test(senha);
    return senha.length >= 8 && temMaiuscula && temMinuscula && temNumero && temSimbolo;
  }
});

// Função para mostrar/esconder senha (global pois pode ser chamada pelo onclick)
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.querySelector(`#${inputId} ~ .toggle-password`);
  
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}