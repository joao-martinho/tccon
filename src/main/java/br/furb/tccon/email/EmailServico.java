// package br.furb.tccon.email;

// import java.time.Instant;
// import java.time.LocalDateTime;
// import java.time.ZoneId;
// import java.util.Map;
// import java.util.concurrent.ThreadLocalRandom;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.stereotype.Service;

// import br.furb.tccon.aluno.AlunoModelo;
// import br.furb.tccon.aluno.AlunoRepositorio;
// import br.furb.tccon.professor.ProfessorModelo;
// import br.furb.tccon.professor.ProfessorRepositorio;
// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class EmailServico {
    
//     @Autowired
//     private final JavaMailSender javaMailSender;
//     private final AlunoRepositorio alunoRepositorio;
//     private final ProfessorRepositorio professorRepositorio;

//     public ResponseEntity<?> enviarCodigoVer(Map<String, String> payload) {
//         String destinatario = payload.get("destinatario");
//         String tipo = payload.get("tipo");
//         Instant instant = Instant.parse(payload.get("criadoEm"));
//         LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        
//         if (tipo.equals("Aluno")) {
//             AlunoModelo alunoModelo = alunoRepositorio.findByEmail(destinatario);
//             if (alunoModelo == null) {
//                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
//             }

//             Integer codigoVer = ThreadLocalRandom.current().nextInt(1000, 10000);

//             SimpleMailMessage mensagem = new SimpleMailMessage();
//             mensagem.setTo(destinatario);
//             mensagem.setSubject("Seu código de verificação do TCCOn");
//             mensagem.setText("Use o código " + codigoVer + " para autenticar-se no TCCOn.");
//             javaMailSender.send(mensagem);

//             alunoModelo.setCodigoVer(codigoVer.toString());
//             alunoModelo.setCriadoEm(localDateTime);
//             alunoRepositorio.save(alunoModelo);
//         }
//         else if (tipo.equals("Professor")) {
//             ProfessorModelo professorModelo = professorRepositorio.findByEmail(destinatario);
//             if (professorModelo == null) {
//                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
//             }

//             Integer codigoVer = ThreadLocalRandom.current().nextInt(1000, 10000);

//             SimpleMailMessage mensagem = new SimpleMailMessage();
//             mensagem.setTo(destinatario);
//             mensagem.setSubject("Seu código de verificação do TCCOn");
//             mensagem.setText("Use o código " + codigoVer + " para autenticar-se no TCCOn.");
//             javaMailSender.send(mensagem);

//             professorModelo.setCodigoVer(codigoVer.toString());
//             professorModelo.setCriadoEm(localDateTime);
//             professorRepositorio.save(professorModelo);
//         }
        
//         return ResponseEntity.ok("Código de verificação enviado.");
//     }

//     public ResponseEntity<String> verificarCodigo(Map<String, String> payload) {
//         String email = payload.get("email");
//         String tipo = payload.get("tipo");
//         String codigoDigitado = payload.get("codigoDigitado");

//         if (tipo.equals("Aluno")) {
//             AlunoModelo alunoModelo = alunoRepositorio.findByEmail(email);
//             if (alunoModelo == null) {
//                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
//             }

//             String codigoVer = alunoModelo.getCodigoVer();
//             if (codigoVer == null || !codigoVer.equals(codigoDigitado)) {
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código inválido!");
//             }

//             LocalDateTime criadoEm = alunoModelo.getCriadoEm();
//             if (criadoEm == null || criadoEm.isBefore(LocalDateTime.now().minusMinutes(10))) {
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código expirado!");
//             }
//         }
//         else if (tipo.equals("Professor")) {
//             ProfessorModelo professorModelo = professorRepositorio.findByEmail(email);
//             if (professorModelo == null) {
//                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
//             }

//             String codigoVer = professorModelo.getCodigoVer();
//             if (codigoVer == null || !codigoVer.equals(codigoDigitado)) {
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código inválido!");
//             }

//             LocalDateTime criadoEm = professorModelo.getCriadoEm();
//             if (criadoEm == null || criadoEm.isBefore(LocalDateTime.now().minusMinutes(10))) {
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código expirado!");
//             }
//         }

        

//         return ResponseEntity.ok("Código verificado com sucesso.");
//     }

//     public ResponseEntity<String> verificarTermo(Map<String, String> payload) {
//         String emailDoAluno = payload.get("emailDoAluno");
//         String emailDoOrientador = payload.get("emailDoOrientador");
//         String emailDoCoorientador = payload.get("emailDoCoorientador");

//         if (emailDoAluno != null && !emailDoAluno.isBlank()) {
//             SimpleMailMessage mensagemParaAluno = new SimpleMailMessage();
//             mensagemParaAluno.setTo(emailDoAluno);
//             mensagemParaAluno.setSubject("Você enviou o seu termo de compromisso no TCCOn");
//             mensagemParaAluno.setText("O seu termo de compromisso foi enviado com sucesso. Agora, aguarde a aprovação do(s) seu(s) orientador(es).");
//             javaMailSender.send(mensagemParaAluno);
//         }

//         if (emailDoOrientador != null && !emailDoOrientador.isBlank()) {
//             SimpleMailMessage mensagemParaOrientador = new SimpleMailMessage();
//             mensagemParaOrientador.setTo(emailDoOrientador);
//             mensagemParaOrientador.setSubject("O seu orientando enviou o termo de compromisso no TCCOn");
//             mensagemParaOrientador.setText("O seu orientando já enviou o termo de compromisso e aguarda a sua aprovação.");
//             javaMailSender.send(mensagemParaOrientador);
//         }

//         if (emailDoCoorientador != null && !emailDoCoorientador.isBlank()) {
//             SimpleMailMessage mensagemParaCoorientador = new SimpleMailMessage();
//             mensagemParaCoorientador.setTo(emailDoCoorientador);
//             mensagemParaCoorientador.setSubject("O seu orientando enviou o termo de compromisso no TCCOn");
//             mensagemParaCoorientador.setText("O seu orientando já enviou o termo de compromisso e aguarda a sua aprovação.");
//             javaMailSender.send(mensagemParaCoorientador);
//         }

//         return ResponseEntity.ok("Código de verificação enviado.");
//     }
// }
