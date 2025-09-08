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
                        projetoDTO.getNomeDoArquivo(),
                        projetoDTO.getCriadoEm().format(formatter),
                        "/projetos/" + projetoDTO.getId() + "/download"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(projetoDTOs);
    }

    @PostMapping("/{email}")
    public ResponseEntity<ProjetoModelo> cadastrarProjetoJson(
            @PathVariable String email,
            @RequestBody ProjetoDTO projetoDTO
    ) throws IOException {
        if (!Files.exists(diretorio)) Files.createDirectories(diretorio);

        byte[] bytesDoArquivo = Base64.getDecoder().decode(projetoDTO.getArquivoBase64());
        String nomeDoArquivo = projetoDTO.getNomeDoArquivo();
        Path destino = diretorio.resolve(nomeDoArquivo);
        Files.write(destino, bytesDoArquivo);

        ProjetoModelo projeto = new ProjetoModelo();
        projeto.setTitulo(projetoDTO.getTitulo());
        projeto.setAutor(email);
        projeto.setNomeDoArquivo(nomeDoArquivo);
        projeto.setCriadoEm(java.time.LocalDateTime.now());

        return projetoServico.cadastrarProjeto(projeto);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadArquivo(@PathVariable Long id) throws IOException {
        ProjetoModelo projeto = projetoServico.buscarProjeto(id).getBody();
        @SuppressWarnings("null")
        Path arquivo = diretorio.resolve(projeto.getNomeDoArquivo());
        byte[] conteudo = Files.readAllBytes(arquivo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + projeto.getNomeDoArquivo() + "\"")
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
