package br.furb.tccon.revisao;

import java.io.IOException;
import java.nio.file.*;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import br.furb.tccon.notificacao.NotificacaoModelo;
import br.furb.tccon.notificacao.NotificacaoServico;
import br.furb.tccon.professor.ProfessorModelo;
import br.furb.tccon.professor.ProfessorRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RevisaoServico {

    private final RevisaoRepositorio revisaoRepositorio;
    private final NotificacaoServico notificacaoServico;
    private final AlunoRepositorio alunoRepositorio;
    private final ProfessorRepositorio professorRepositorio;
    private final Path diretorio = Paths.get("uploads/revisoes");

    public ResponseEntity<RevisaoModelo> cadastrar(String email, RevisaoUploadDTO dto) throws IOException {
        if (!Files.exists(diretorio)) Files.createDirectories(diretorio);

        byte[] bytes = Base64.getDecoder().decode(dto.getArquivoBase64());
        Path destino = diretorio.resolve(dto.getNomeArquivo());
        Files.write(destino, bytes);

        RevisaoModelo revisao = new RevisaoModelo();
        revisao.setTitulo(dto.getTitulo());
        revisao.setEmailAutor(email);
        revisao.setEmailAluno(dto.getEmailAluno());
        revisao.setNomeArquivo(dto.getNomeArquivo());
        revisao.setArquivoBase64(dto.getArquivoBase64());

        RevisaoModelo salvo = revisaoRepositorio.save(revisao);
        ProfessorModelo professorModelo = professorRepositorio.findByEmail(email);

        NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
        notificacaoAluno.setEmailDestinatario(dto.getEmailAluno());
        notificacaoAluno.setTitulo("Nova revisão recebida");
        notificacaoAluno.setConteudo(
            professorModelo.getNome() + " enviou uma nova revisão: \"" + dto.getTitulo() + "\"."
        );
        notificacaoServico.cadastrarMensagem(notificacaoAluno);

        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(dto.getEmailAluno());

        NotificacaoModelo notificacaoProfessor = new NotificacaoModelo();
        notificacaoProfessor.setEmailDestinatario(email);
        notificacaoProfessor.setTitulo("Revisão enviada");
        notificacaoProfessor.setConteudo(
            "A sua revisão \"" + dto.getTitulo() + "\" foi enviada a " + alunoModelo.getNome() + "."
        );
        notificacaoServico.cadastrarMensagem(notificacaoProfessor);

        return ResponseEntity.status(201).body(salvo);
    }

    public ResponseEntity<byte[]> download(Long id) throws IOException {
        RevisaoModelo revisao = revisaoRepositorio.findById(id).orElse(null);
        if (revisao == null) return ResponseEntity.notFound().build();

        Path arquivo = diretorio.resolve(revisao.getNomeArquivo());
        byte[] conteudo = Files.readAllBytes(arquivo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + revisao.getNomeArquivo() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(conteudo);
    }

    public ResponseEntity<List<RevisaoDTO>> listarTodas() {
        List<RevisaoDTO> dtos = revisaoRepositorio.findAll().stream()
            .map(RevisaoDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<List<RevisaoDTO>> listarPorProfessor(String email) {
        List<RevisaoDTO> dtos = revisaoRepositorio.findByEmailAutor(email).stream()
            .map(RevisaoDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<List<RevisaoDTO>> listarPorAluno(String email) {
        List<RevisaoDTO> dtos = revisaoRepositorio.findByEmailAluno(email).stream()
            .map(RevisaoDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
