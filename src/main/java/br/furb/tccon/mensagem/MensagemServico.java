package br.furb.tccon.mensagem;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MensagemServico {
    
    private final MensagemRepositorio mensagemRepositorio;

    public ResponseEntity<Iterable<MensagemModelo>> listarMensagems() {
        return new ResponseEntity<>(this.mensagemRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<MensagemModelo> cadastrarMensagem(MensagemModelo mensagemModelo) {
        return new ResponseEntity<>(this.mensagemRepositorio.save(mensagemModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<MensagemModelo> alterarMensagemTotal(Long id, MensagemModelo mensagemModelo) {
        Optional<MensagemModelo> optional = this.mensagemRepositorio.findById(id);
        
        if (optional.isPresent()) {
            mensagemModelo.setId(id);
            return new ResponseEntity<>(this.mensagemRepositorio.save(mensagemModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<MensagemModelo> alterarMensagemParcial(Long id, MensagemModelo mensagemModelo) {
        Optional<MensagemModelo> optional = this.mensagemRepositorio.findById(id);

        if (optional.isPresent()) {
            MensagemModelo mensagemModelo2 = optional.get();

            if (mensagemModelo.getTitulo() != null) {
                mensagemModelo2.setTitulo(mensagemModelo.getTitulo());
            }

            if (mensagemModelo.getEmailRemetente() != null) {
                mensagemModelo2.setEmailRemetente(mensagemModelo.getEmailRemetente());
            }

            if (mensagemModelo.getEmailDestinatario() != null) {
                mensagemModelo2.setEmailDestinatario(mensagemModelo.getEmailDestinatario());
            }

            if (mensagemModelo.getConteudo() != null) {
                mensagemModelo2.setConteudo(mensagemModelo.getConteudo());
            }

            return new ResponseEntity<>(this.mensagemRepositorio.save(mensagemModelo2), HttpStatus.OK);
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

    public ResponseEntity<MensagemModelo> buscarMensagem(Long id) {
        boolean existeId = this.mensagemRepositorio.existsById(id);

        if (existeId) {
            Optional<MensagemModelo> optional = this.mensagemRepositorio.findById(id);

            MensagemModelo mensagemModelo = optional.get();

            return new ResponseEntity<>(mensagemModelo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<MensagemModelo> buscarPorEmailDestinatario(String email) {
        MensagemModelo mensagemModelo = this.mensagemRepositorio.findByEmailDestinatario(email);
        return new ResponseEntity<>(mensagemModelo, HttpStatus.OK);
    }

    public ResponseEntity<Void> marcarComoLida(Long id) {
        boolean existeId = this.mensagemRepositorio.existsById(id);

        if (existeId) {
            Optional<MensagemModelo> optional = this.mensagemRepositorio.findById(id);
            MensagemModelo mensagemModelo = optional.get();
            mensagemModelo.setLida(true);

            return new ResponseEntity<>(HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

}
