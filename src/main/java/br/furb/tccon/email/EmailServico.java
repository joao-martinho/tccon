package br.furb.tccon.email;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServico {
    
    private final JavaMailSender javaMailSender;
    private final AlunoRepositorio alunoRepositorio;

    public ResponseEntity<?> enviarCodigoDeVerificacao(Map<String, String> payload) {
        String destinatario = payload.get("destinatario");
        Instant instant = Instant.parse(payload.get("criadoEm"));
        LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());

        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(destinatario);
        if (alunoModelo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("E-mail não encontrado.");
        }

        Integer codigoDeVerificacao = ThreadLocalRandom.current().nextInt(1000, 10000);

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(destinatario);
        mensagem.setSubject("Seu código de verificação do TCCOn");
        mensagem.setText("Use o código " + codigoDeVerificacao + " para autenticar-se no TCCOn.");
        // javaMailSender.send(mensagem);

        alunoModelo.setCodigoDeVerificacao(codigoDeVerificacao.toString());
        alunoModelo.setCriadoEm(localDateTime);
        alunoRepositorio.save(alunoModelo);

        return ResponseEntity.ok("Código de verificação enviado.");
    }

    public ResponseEntity<String> verificarCodigo(Map<String, String> payload) {
        String email = payload.get("email");
        String codigoDigitado = payload.get("codigoDigitado");

        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(email);
        if (alunoModelo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
        }

        String codigoDeVerificacao = alunoModelo.getCodigoDeVerificacao();
        if (codigoDeVerificacao == null || !codigoDeVerificacao.equals(codigoDigitado)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código inválido!");
        }

        LocalDateTime criadoEm = alunoModelo.getCriadoEm();
        if (criadoEm == null || criadoEm.isBefore(LocalDateTime.now().minusMinutes(10))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código expirado!");
        }

        return ResponseEntity.ok("Código verificado com sucesso.");
    }
}
