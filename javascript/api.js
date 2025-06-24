// Outros arquivos javascript devem importar este para poder acessar a API com import { callApi } from "./api.js";
//
// ============================================================================================================================================
// FUNÇÃO INTERNA - CHAMAR API
// ============================================================================================================================================

const API_HOST = "http://localhost:8080";

export async function callApi({ url, method = "GET", body = null, token = null }) {
  const fullUrl = `${API_HOST}${url}`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  options.body = JSON.stringify(body);

  try {
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}`;

      switch (response.status) {
        case 400:
          errorMessage = "Requisição inválida (400)";
          break;
        case 401:
          errorMessage = "Não autorizado (401) - Verifique seu login ou token.";
          break;
        case 403:
          errorMessage = "Acesso proibido (403) - Você não tem permissão.";
          break;
        case 404:
          errorMessage = "Recurso não encontrado (404)";
          break;
        case 500:
          errorMessage = "Erro interno do servidor (500)";
          break;
        default:
          const errorText = await response.text();
          errorMessage = `Erro ${response.status}: ${errorText}`;
          break;
      }

      // Mostra o popup com o erro
      window.alert(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Erros de rede, timeout, etc.
    window.alert(`Erro na conexão com o servidor: ${error.message}`);
    throw error;
  }
}
