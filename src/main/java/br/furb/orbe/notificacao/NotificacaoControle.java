package br.furb.orbe.notificacao;

import java.util.List;

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
@RequestMapping("/notificacoes")
public class NotificacaoControle {
    
    private final NotificacaoServico notificacaoServico;

    @GetMapping
    public ResponseEntity<Iterable<NotificacaoModelo>> listarMensagems() {
        return this.notificacaoServico.listarMensagems();
    }

    @PostMapping
    public ResponseEntity<NotificacaoModelo> cadastrarMensagem(@Valid @RequestBody NotificacaoModelo notificacaoModelo) {
        return this.notificacaoServico.cadastrarMensagem(notificacaoModelo);
    }

    @GetMapping("/{email}")
    public ResponseEntity<List<NotificacaoModelo>> buscarPorEmailDestinatario(@PathVariable String email) {
        return this.notificacaoServico.buscarPorEmailDestinatario(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificacaoModelo> alterarMensagemTotal(@Valid @PathVariable Long id, @RequestBody NotificacaoModelo notificacaoModelo) {
        return this.notificacaoServico.alterarMensagemTotal(id, notificacaoModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<NotificacaoModelo> alterarMensagemParcial(@PathVariable Long id, @RequestBody NotificacaoModelo notificacaoModelo) {
        return this.notificacaoServico.alterarMensagemParcial(id, notificacaoModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerMensagem(@PathVariable Long id) {
        return this.notificacaoServico.removerMensagem(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        notificacaoServico.removerTodos();
    }

    @PatchMapping("/{id}/marcar-lida")
    public ResponseEntity<NotificacaoModelo> marcarComoLida(@PathVariable Long id) {
        return this.notificacaoServico.marcarComoLida(id);
    }

}

