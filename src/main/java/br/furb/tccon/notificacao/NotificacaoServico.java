package br.furb.tccon.notificacao;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificacaoServico {
    
    private final NotificacaoRepositorio mensagemRepositorio;

    public ResponseEntity<Iterable<NotificacaoModelo>> listarMensagems() {
        return new ResponseEntity<>(this.mensagemRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<NotificacaoModelo> cadastrarMensagem(NotificacaoModelo notificacaoModelo) {
        return new ResponseEntity<>(this.mensagemRepositorio.save(notificacaoModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<NotificacaoModelo> alterarMensagemTotal(Long id, NotificacaoModelo notificacaoModelo) {
        Optional<NotificacaoModelo> optional = this.mensagemRepositorio.findById(id);
        
        if (optional.isPresent()) {
            notificacaoModelo.setId(id);
            return new ResponseEntity<>(this.mensagemRepositorio.save(notificacaoModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<NotificacaoModelo> alterarMensagemParcial(Long id, NotificacaoModelo notificacaoModelo) {
        Optional<NotificacaoModelo> optional = this.mensagemRepositorio.findById(id);

        if (optional.isPresent()) {
            NotificacaoModelo notificacaoModelo2 = optional.get();

            if (notificacaoModelo.getTitulo() != null) {
                notificacaoModelo2.setTitulo(notificacaoModelo.getTitulo());
            }

            if (notificacaoModelo.getEmailDestinatario() != null) {
                notificacaoModelo2.setEmailDestinatario(notificacaoModelo.getEmailDestinatario());
            }

            if (notificacaoModelo.getConteudo() != null) {
                notificacaoModelo2.setConteudo(notificacaoModelo.getConteudo());
            }

            notificacaoModelo2.setLida(notificacaoModelo.isLida());

            return new ResponseEntity<>(this.mensagemRepositorio.save(notificacaoModelo2), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerMensagem(Long id) {
        boolean existeId = this.mensagemRepositorio.existsById(id);

        if (existeId) {
            this.mensagemRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        this.mensagemRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<NotificacaoModelo> buscarMensagem(Long id) {
        boolean existeId = this.mensagemRepositorio.existsById(id);

        if (existeId) {
            Optional<NotificacaoModelo> optional = this.mensagemRepositorio.findById(id);

            NotificacaoModelo notificacaoModelo = optional.get();

            return new ResponseEntity<>(notificacaoModelo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<List<NotificacaoModelo>> buscarPorEmailDestinatario(String email) {
        List<NotificacaoModelo> notificacaoModelos = this.mensagemRepositorio.findByEmailDestinatario(email);
        return new ResponseEntity<>(notificacaoModelos, HttpStatus.OK);
    }

    public ResponseEntity<NotificacaoModelo> marcarComoLida(Long id) {
        boolean existeId = this.mensagemRepositorio.existsById(id);

        if (existeId) {
            Optional<NotificacaoModelo> optional = this.mensagemRepositorio.findById(id);
            NotificacaoModelo notificacaoModelo = optional.get();
            notificacaoModelo.setLida(true);

            return new ResponseEntity<>(this.mensagemRepositorio.save(notificacaoModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

}
