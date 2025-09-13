package br.furb.tccon.documento;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentoServico {

    private final DocumentoRepositorio documentoRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final Path diretorio = Paths.get("uploads");

    public ResponseEntity<DocumentoModelo> cadastrarDocumento(String email, DocumentoUploadDTO documentoUpload) throws IOException {
        AlunoModelo aluno = alunoRepositorio.findByEmail(email);
        return salvarDocumento(email, documentoUpload, aluno);
    }

    public ResponseEntity<DocumentoModelo> cadastrarRevisao(String email, DocumentoUploadDTO documentoUpload) throws IOException {
        AlunoModelo aluno = alunoRepositorio.findByEmail(email);
        return salvarDocumento(email, documentoUpload, aluno);
    }

    private ResponseEntity<DocumentoModelo> salvarDocumento(String email, DocumentoUploadDTO dto, AlunoModelo aluno) throws IOException {
        if (!Files.exists(diretorio)) Files.createDirectories(diretorio);

        byte[] bytesArquivo = Base64.getDecoder().decode(dto.getArquivoBase64());
        Path destino = diretorio.resolve(dto.getNomeArquivo());
        Files.write(destino, bytesArquivo);

        DocumentoModelo documento = new DocumentoModelo(
            dto.getTitulo(),
            email,
            aluno.getOrientador(),
            aluno.getCoorientador(),
            dto.getNomeArquivo(),
            dto.getArquivoBase64()
        );

        DocumentoModelo salvo = documentoRepositorio.save(documento);
        return ResponseEntity.status(201).body(salvo);
    }

    public ResponseEntity<Iterable<DocumentoModelo>> listarDocumentos() {
        return ResponseEntity.ok(documentoRepositorio.findAll());
    }

    public ResponseEntity<byte[]> downloadDocumento(Long id) throws IOException {
        DocumentoModelo documento = documentoRepositorio.findById(id).orElse(null);
        if (documento == null) return ResponseEntity.notFound().build();

        Path arquivo = diretorio.resolve(documento.getNomeArquivo());
        byte[] conteudo = Files.readAllBytes(arquivo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documento.getNomeArquivo() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(conteudo);
    }

    public ResponseEntity<DocumentoModelo> alterarDocumentoTotal(Long id, DocumentoModelo documentoModelo) {
        return documentoRepositorio.findById(id)
                .map(p -> {
                    documentoModelo.setId(id);
                    return ResponseEntity.ok(documentoRepositorio.save(documentoModelo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<DocumentoModelo> alterarDocumentoParcial(Long id, DocumentoModelo documentoModelo) {
        return documentoRepositorio.findById(id)
                .map(p -> {
                    if (documentoModelo.getTitulo() != null) p.setTitulo(documentoModelo.getTitulo());
                    return ResponseEntity.ok(documentoRepositorio.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<Void> removerDocumento(Long id) {
        if (documentoRepositorio.existsById(id)) {
            documentoRepositorio.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    public ResponseEntity<Void> removerTodos() {
        documentoRepositorio.truncateTable();
        return ResponseEntity.ok().build();
    }

    public List<DocumentoModelo> listarPorEmailAutor(String email) {
        return documentoRepositorio.findByEmailAutor(email);
    }

    public List<DocumentoModelo> listarPorEmailOrientador(String email) {
        return documentoRepositorio.findByEmailOrientador(email);
    }

    public List<DocumentoModelo> listarPorEmailCoorientador(String email) {
        return documentoRepositorio.findByEmailCoorientador(email);
    }

    public ResponseEntity<List<DocumentoDTO>> listarDocumentosPorPessoa(String email, String tipo) {
        List<DocumentoModelo> documentos;
        switch (tipo) {
            case "aluno":
                documentos = listarPorEmailAutor(email);
                break;
            case "professor":
                documentos = listarPorEmailProfessor(email);
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        List<DocumentoDTO> dtos = documentos.stream()
                .map(p -> new DocumentoDTO(
                        p.getId(),
                        p.getTitulo(),
                        p.getEmailAutor(),
                        p.getNomeArquivo(),
                        p.getCriadoEm().toString(),
                        "/documentos/" + p.getId() + "/download",
                        p.getEmailOrientador(),
                        p.getEmailCoorientador()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private List<DocumentoModelo> listarPorEmailProfessor(String email) {
        List<DocumentoModelo> comoOrientador = listarPorEmailOrientador(email);
        List<DocumentoModelo> comoCoorientador = listarPorEmailCoorientador(email);

        Set<DocumentoModelo> resultado = new HashSet<>(comoOrientador);
        resultado.addAll(comoCoorientador);
        return new ArrayList<>(resultado);
    }

}
