package br.furb.tccon.mensagem;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/mensagems")
public class MensagemControle {
    
    private final MensagemServico MensagemServico;

    @GetMapping
    public ResponseEntity<Iterable<MensagemModelo>> listarMensagems() {
        return this.MensagemServico.listarMensagems();
    }

    @PostMapping
    public ResponseEntity<MensagemModelo> cadastrarMensagem(@Valid @RequestBody MensagemModelo MensagemModelo) {
        return this.MensagemServico.cadastrarMensagem(MensagemModelo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MensagemModelo> buscarMensagem(@PathVariable Long id) {
        return this.MensagemServico.buscarMensagem(id);
    }

    @GetMapping("/{id}/{email}")
    public ResponseEntity<MensagemModelo> buscarPorEmail(@PathVariable String email) {
        return this.MensagemServico.buscarPorEmail(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MensagemModelo> alterarMensagemTotal(@Valid @PathVariable Long id, @RequestBody MensagemModelo MensagemModelo) {
        return this.MensagemServico.alterarMensagemTotal(id, MensagemModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MensagemModelo> alterarMensagemParcial(@PathVariable Long id, @RequestBody MensagemModelo MensagemModelo) {
        return this.MensagemServico.alterarMensagemParcial(id, MensagemModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerMensagem(@PathVariable Long id) {
        return this.MensagemServico.removerMensagem(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        MensagemServico.removerTodos();
    }

}

