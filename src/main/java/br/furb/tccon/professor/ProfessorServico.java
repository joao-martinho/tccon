package br.furb.tccon.professor;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfessorServico {

    private final ProfessorRepositorio professorRepositorio;
    
    public ResponseEntity<Iterable<ProfessorModelo>> listarProfessores() {
        return new ResponseEntity<>(this.professorRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<ProfessorModelo> cadastrarProfessor(ProfessorModelo professorModelo) {
        return new ResponseEntity<>(this.professorRepositorio.save(professorModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<ProfessorModelo> alterarProfessorTotal(String email, ProfessorModelo professorModelo) {
        Optional<ProfessorModelo> optional = this.professorRepositorio.findById(email);
        
        if (optional.isPresent()) {
            professorModelo.setEmail(email);
            return new ResponseEntity<>(this.professorRepositorio.save(professorModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<ProfessorModelo> alterarProfessorParcial(String email, ProfessorModelo professorModelo) {
        Optional<ProfessorModelo> optional = this.professorRepositorio.findById(email);

        if (optional.isPresent()) {
            ProfessorModelo professorModelo2 = optional.get();

            if (professorModelo.getNome() != null) {
                professorModelo2.setNome(professorModelo.getNome());
            }

            if (professorModelo.getEmail() != null) {
                professorModelo2.setEmail(professorModelo.getEmail());
            }

            if (professorModelo.getSenha() != null) {
                professorModelo2.setSenha(professorModelo.getSenha());
            }

            return new ResponseEntity<>(this.professorRepositorio.save(professorModelo2), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerProfessor(String email) {
        boolean existeemail = this.professorRepositorio.existsById(email);

        if (existeemail) {
            this.professorRepositorio.deleteById(email);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        this.professorRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<ProfessorModelo> localizarProfessor(String email) {
        boolean existeemail = this.professorRepositorio.existsById(email);

        if (existeemail) {
            Optional<ProfessorModelo> optional = this.professorRepositorio.findById(email);

            ProfessorModelo ProfessorModelo = optional.get();

            return new ResponseEntity<>(ProfessorModelo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
