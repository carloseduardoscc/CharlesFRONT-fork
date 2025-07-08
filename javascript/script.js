import { callApi } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  // ============ TEXTO ANIMADO - VERSÃO REFATORADA ============
  const typedTextSpan = document.querySelector(".texto-animado");
  if (typedTextSpan) {
    const textArray = ["em cada Solicitação", "em cada Chamado", "É Charles²"];
    const typingDelay = 100;
    const erasingDelay = 150;
    const newTextDelay = 1000;
    let textArrayIndex = 0;
    let charIndex = 0;
    let isTyping = true;

    function type() {
      if (charIndex < textArray[textArrayIndex].length) {
        typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);
      } else {
        isTyping = false;
        setTimeout(erase, newTextDelay);
      }
    }

    function erase() {
      if (charIndex > 0) {
        typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingDelay);
      } else {
        isTyping = true;
        textArrayIndex = (textArrayIndex + 1) % textArray.length;
        setTimeout(type, typingDelay + 500);
      }
    }

    // Inicia com o texto vazio e começa a digitar
    typedTextSpan.textContent = "";
    setTimeout(type, typingDelay + 500);
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

// Código do carrossel (mantido igual)
document.addEventListener('DOMContentLoaded', () => {
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselItems = Array.from(carouselTrack.children);
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const carouselDotsContainer = document.querySelector('.carousel-dots');

    let currentIndex = 0;
    let itemWidth = carouselItems[0].offsetWidth + (parseFloat(getComputedStyle(carouselItems[0]).marginRight) * 2);

    const updateItemWidth = () => {
        if (carouselItems.length > 0) {
            const itemMarginRight = parseFloat(getComputedStyle(carouselItems[0]).marginRight);
            const itemMarginLeft = parseFloat(getComputedStyle(carouselItems[0]).marginLeft);
            itemWidth = carouselItems[0].offsetWidth + itemMarginLeft + itemMarginRight;
        }
    };

    const generateDots = () => {
        carouselDotsContainer.innerHTML = '';
        carouselItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === currentIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                moveToSlide(index);
            });
            carouselDotsContainer.appendChild(dot);
        });
    };

    const moveToSlide = (index) => {
        currentIndex = index;
        const offset = -currentIndex * itemWidth;
        carouselTrack.style.transform = `translateX(${offset}px)`;
        updateDots();
    };

    const updateDots = () => {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    const slideNext = () => {
        if (currentIndex < carouselItems.length - 1) {
            moveToSlide(currentIndex + 1);
        } else {
            moveToSlide(0);
        }
    };

    const slidePrev = () => {
        if (currentIndex > 0) {
            moveToSlide(currentIndex - 1);
        } else {
            moveToSlide(carouselItems.length - 1);
        }
    };

    nextButton.addEventListener('click', slideNext);
    prevButton.addEventListener('click', slidePrev);

    window.addEventListener('resize', () => {
        updateItemWidth();
        moveToSlide(currentIndex);
    });

    updateItemWidth();
    generateDots();
    moveToSlide(currentIndex);
});
// Função para exibir o modal de login
function showLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "block";
  }
}

// Função para exibir o modal de confirmação de saída
function showExitConfirmationModal() {
  const modal = document.getElementById("exitConfirmationModal");
  if (modal) {
    modal.style.display = "block";
  }
}