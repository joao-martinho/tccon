package br.furb.tccon.documento;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/documentos")
public class DocumentoControle {

    private final DocumentoServico documentoServico;

    @GetMapping
    public ResponseEntity<Iterable<DocumentoModelo>> listarDocumentos() {
        return documentoServico.listarDocumentos();
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<List<DocumentoDTO>> listarDocumentoPorAluno(@PathVariable String email) {
        return documentoServico.listarDocumentosPorPessoa(email, "aluno");
    } 

    @GetMapping("/professor/{email}")
    public ResponseEntity<List<DocumentoDTO>> listarDocumentoPorProfessor(@PathVariable String email) {
        return documentoServico.listarDocumentosPorPessoa(email, "professor");
    } 

    @PostMapping("/aluno/{email}")
    public ResponseEntity<DocumentoModelo> cadastrarDocumentoJson(
        @PathVariable String email,
        @RequestBody DocumentoUploadDTO documentoUpload
    ) throws IOException {
        return documentoServico.cadastrarDocumento(email, documentoUpload);
    }

    @PostMapping("/professor/{email}")
    public ResponseEntity<DocumentoModelo> cadastrarRevisaoJson(
        @PathVariable String email,
        @RequestBody DocumentoUploadDTO documentoUpload
    ) throws IOException {
        return documentoServico.cadastrarRevisao(email, documentoUpload);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadNomeArquivo(@PathVariable Long id) throws IOException {
        return documentoServico.downloadDocumento(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentoModelo> alterarDocumentoTotal(@PathVariable Long id, @RequestBody DocumentoModelo documentoModelo) {
        return documentoServico.alterarDocumentoTotal(id, documentoModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DocumentoModelo> alterarDocumentoParcial(@PathVariable Long id, @RequestBody DocumentoModelo documentoModelo) {
        return documentoServico.alterarDocumentoParcial(id, documentoModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerDocumento(@PathVariable Long id) {
        return documentoServico.removerDocumento(id);
    }

    @DeleteMapping
    public ResponseEntity<Void> deletarTodos() {
        return documentoServico.removerTodos();
    }
}
