package br.furb.tccon.projeto;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjetoServico {

    private final ProjetoRepositorio projetoRepositorio;

    public ResponseEntity<Iterable<ProjetoModelo>> listarProjetos() {
        return new ResponseEntity<>(this.projetoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<ProjetoModelo> cadastrarProjeto(ProjetoModelo projetoModelo) {
        return new ResponseEntity<>(this.projetoRepositorio.save(projetoModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<ProjetoModelo> alterarProjetoTotal(Long id, ProjetoModelo projetoModelo) {
        Optional<ProjetoModelo> optional = this.projetoRepositorio.findById(id);

        if (optional.isPresent()) {
            projetoModelo.setId(id);
            return new ResponseEntity<>(this.projetoRepositorio.save(projetoModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<ProjetoModelo> alterarProjetoParcial(Long id, ProjetoModelo projetoModelo) {
        Optional<ProjetoModelo> optional = this.projetoRepositorio.findById(id);

        if (optional.isPresent()) {
            ProjetoModelo projetoExistente = optional.get();

            if (projetoModelo.getTitulo() != null) {
                projetoExistente.setTitulo(projetoModelo.getTitulo());
            }

            return new ResponseEntity<>(this.projetoRepositorio.save(projetoExistente), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerProjeto(Long id) {
        if (this.projetoRepositorio.existsById(id)) {
            this.projetoRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<ProjetoModelo> buscarProjeto(Long id) {
        Optional<ProjetoModelo> optional = this.projetoRepositorio.findById(id);

        return optional
                .map(projeto -> new ResponseEntity<>(projeto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Void> removerTodos() {
        this.projetoRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public List<ProjetoModelo> listarPorAutor(String email) {
        return projetoRepositorio.findByAutor(email);
    }
}
