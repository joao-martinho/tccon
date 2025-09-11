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
@RequestMapping("/mensagens")
public class MensagemControle {
    
    private final MensagemServico mensagemServico;

    @GetMapping
    public ResponseEntity<Iterable<MensagemModelo>> listarMensagems() {
        return this.mensagemServico.listarMensagems();
    }

    @PostMapping
    public ResponseEntity<MensagemModelo> cadastrarMensagem(@Valid @RequestBody MensagemModelo MensagemModelo) {
        return this.mensagemServico.cadastrarMensagem(MensagemModelo);
    }

    @GetMapping("/{email}")
    public ResponseEntity<MensagemModelo> buscarPorEmailDestinatario(@PathVariable String email) {
        return this.mensagemServico.buscarPorEmailDestinatario(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MensagemModelo> alterarMensagemTotal(@Valid @PathVariable Long id, @RequestBody MensagemModelo MensagemModelo) {
        return this.mensagemServico.alterarMensagemTotal(id, MensagemModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MensagemModelo> alterarMensagemParcial(@PathVariable Long id, @RequestBody MensagemModelo MensagemModelo) {
        return this.mensagemServico.alterarMensagemParcial(id, MensagemModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerMensagem(@PathVariable Long id) {
        return this.mensagemServico.removerMensagem(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        mensagemServico.removerTodos();
    }

    @PatchMapping("/{id}/marcar-lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Long id) {
        return this.mensagemServico.marcarComoLida(id);
    }

}

