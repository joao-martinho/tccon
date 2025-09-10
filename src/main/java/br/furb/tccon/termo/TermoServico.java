package br.furb.tccon.termo;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TermoServico {
    
    private final TermoRepositorio termoRepositorio;

    public ResponseEntity<Iterable<TermoModelo>> listarTermos() {
        return new ResponseEntity<>(this.termoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<TermoModelo> cadastrarTermo(TermoModelo TermoModelo) {
        return new ResponseEntity<>(this.termoRepositorio.save(TermoModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<TermoModelo> alterarTermoTotal(Long id, TermoModelo TermoModelo) {
        Optional<TermoModelo> optional = this.termoRepositorio.findById(id);
        
        if (optional.isPresent()) {
            TermoModelo.setId(id);
            return new ResponseEntity<>(this.termoRepositorio.save(TermoModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<TermoModelo> alterarTermoParcial(Long id, String email, TermoModelo termoModelo) {
        Optional<TermoModelo> optional = this.termoRepositorio.findById(id);

        if (optional.isPresent()) {
            TermoModelo termoModelo2 = optional.get();

            if (termoModelo.getId() != null) {
                termoModelo2.setId(termoModelo.getId());
            }

            if (termoModelo.getTitulo() != null) {
                termoModelo2.setTitulo(termoModelo.getTitulo());
            }

            if (termoModelo.getEmailDoAluno() != null) {
                termoModelo2.setEmailDoAluno(termoModelo.getEmailDoAluno());
            }

            if (termoModelo.getEmailDoOrientador() != null) {
                termoModelo2.setEmailDoOrientador(termoModelo.getEmailDoOrientador());
            }

            if (termoModelo.getPerfilDoCoorientador() != null) {
                termoModelo2.setPerfilDoCoorientador(termoModelo.getPerfilDoCoorientador());
            }

            if (termoModelo.getAno() != null) {
                termoModelo2.setAno(termoModelo.getAno());
            }

            if (termoModelo.getSemestre() != null) {
                termoModelo2.setSemestre(termoModelo.getSemestre());
            }

            if (termoModelo.getResumo() != null) {
                termoModelo2.setResumo(termoModelo.getResumo());
            }

            if (termoModelo.getStatusDoOrientador() != null && email.equals(termoModelo.getEmailDoOrientador())) {
                termoModelo2.setStatusDoOrientador(termoModelo.getStatusDoOrientador());
            }

            if (termoModelo.getStatusDoCoorientador() != null && email.equals(termoModelo.getEmailDoCoorientador())) {
                termoModelo2.setEmailDoCoorientador(termoModelo.getStatusDoCoorientador());
            }

            return new ResponseEntity<>(this.termoRepositorio.save(termoModelo2), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTermo(Long id) {
        boolean existeid = this.termoRepositorio.existsById(id);

        if (existeid) {
            this.termoRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<TermoModelo> buscarTermo(Long id) {
        boolean existeId = this.termoRepositorio.existsById(id);

        if (existeId) {
            Optional<TermoModelo> optional = this.termoRepositorio.findById(id);

            TermoModelo TermoModelo = optional.get();

            return new ResponseEntity<>(TermoModelo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        this.termoRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<TermoModelo> buscarTermosPorEmailDoAluno(String email) {
        TermoModelo termoModelo = this.termoRepositorio.findByEmailDoAluno(email);

        return new ResponseEntity<>(termoModelo, HttpStatus.OK);
    }

    public ResponseEntity<List<TermoModelo>> buscarTermosPorEmailDoProfessor(String email) {
        List<TermoModelo> termoModelos = this.termoRepositorio.findByEmailDoOrientador(email);
        termoModelos.addAll(this.termoRepositorio.findByEmailDoCoorientador(email));

        return new ResponseEntity<>(termoModelos, HttpStatus.OK);
    }

}
