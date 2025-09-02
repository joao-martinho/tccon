package br.furb.tccon.email;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/emails")
public class EmailControle {
    
    private final EmailServico emailServico;

    @PostMapping("/codigo-de-verificacao")
    public ResponseEntity<?> enviarCodigoDeVerificacao(@RequestBody Map<String, String> payload) {
        return emailServico.enviarCodigoDeVerificacao(payload);
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<String> verificarCodigo(@RequestBody Map<String, String> payload) {
        return emailServico.verificarCodigo(payload);
    }
}
