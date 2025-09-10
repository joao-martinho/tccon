package br.furb.tccon.projeto;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/projetos")
public class ProjetoControle {

    private final ProjetoServico projetoServico;
    private final Path diretorio = Paths.get("uploads");

    @GetMapping
    public ResponseEntity<Iterable<ProjetoModelo>> listarProjetos() {
        return projetoServico.listarProjetos();
    }

    @GetMapping("/{email}")
    public ResponseEntity<List<ProjetoDTO>> listarProjetosDoAluno(@PathVariable String email) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        List<ProjetoDTO> projetoDTOs = projetoServico.listarPorAutor(email)
                .stream()
                .map(projetoDTO -> new ProjetoDTO(
                        projetoDTO.getId(),
                        projetoDTO.getTitulo(),
                        projetoDTO.getAutor(),
                        projetoDTO.getNomeArquivo(),
                        projetoDTO.getCriadoEm().format(formatter),
                        "/projetos/" + projetoDTO.getId() + "/download"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(projetoDTOs);
    }

    @PostMapping("/{email}")
    public ResponseEntity<ProjetoModelo> cadastrarProjetoJson(
        @PathVariable String email,
        @RequestBody ProjetoUploadDTO projetoUpload
    ) throws IOException {
        if (!Files.exists(diretorio)) Files.createDirectories(diretorio);

        byte[] bytesNomeArquivo = Base64.getDecoder().decode(projetoUpload.getArquivoBase64());
        String nomeArquivo = projetoUpload.getNomeArquivo();
        Path destino = diretorio.resolve(nomeArquivo);
        Files.write(destino, bytesNomeArquivo);

        ProjetoModelo projeto = new ProjetoModelo();
        projeto.setTitulo(projetoUpload.getTitulo());
        projeto.setAutor(email);
        projeto.setNomeArquivo(nomeArquivo);
        projeto.setCriadoEm(java.time.LocalDateTime.now());

        return projetoServico.cadastrarProjeto(projeto);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadnomeArquivo(@PathVariable Long id) throws IOException {
        ProjetoModelo projeto = projetoServico.buscarProjeto(id).getBody();
        @SuppressWarnings("null")
        Path nomeArquivo = diretorio.resolve(projeto.getNomeArquivo());
        byte[] conteudo = Files.readAllBytes(nomeArquivo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + projeto.getNomeArquivo() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(conteudo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjetoModelo> alterarProjetoTotal(@PathVariable Long id, @RequestBody ProjetoModelo ProjetoModelo) {
        return projetoServico.alterarProjetoTotal(id, ProjetoModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjetoModelo> alterarProjetoParcial(@PathVariable Long id, @RequestBody ProjetoModelo ProjetoModelo) {
        return projetoServico.alterarProjetoParcial(id, ProjetoModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerProjeto(@PathVariable Long id) {
        return projetoServico.removerProjeto(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        projetoServico.removerTodos();
    }

}
