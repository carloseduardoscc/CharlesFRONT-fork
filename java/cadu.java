import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import javax.validation.Valid;

@RestController
@RequestMapping("/contactRequest")
public class ContactController {

    @PostMapping
    public ResponseEntity<ApiResponse> handleContactRequest(
            @Valid @RequestBody ContactRequest request) {
        
        // Processar a requisição (salvar no banco de dados, enviar email, etc.)
        boolean isSuccess = processContactRequest(request);
        
        if (isSuccess) {
            return ResponseEntity.ok(
                new ApiResponse("Sua mensagem foi recebida com sucesso! Entraremos em contato em breve.")
            );
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde."));
        }
    }
    
    private boolean processContactRequest(ContactRequest request) {
        try {
            // Lógica para processar a requisição
            // Exemplo: salvar no banco de dados ou enviar email
            
            // Simulação de sucesso
            return true;
        } catch (Exception e) {
            // Logar o erro
            return false;
        }
    }
    
    // Classe para representar a requisição
    public static class ContactRequest {
        @NotBlank(message = "O nome é obrigatório")
        private String name;
        
        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        private String email;
        
        private String phone;
        
        @NotBlank(message = "O assunto é obrigatório")
        private String subject;
        
        @NotBlank(message = "A mensagem é obrigatória")
        @Size(min = 10, message = "A mensagem deve ter pelo menos 10 caracteres")
        private String message;
        
        // Getters e Setters
    }
    
    // Classe para representar a resposta
    public static class ApiResponse {
        private String message;
        
        public ApiResponse(String message) {
            this.message = message;
        }
        
        // Getter
    }
}