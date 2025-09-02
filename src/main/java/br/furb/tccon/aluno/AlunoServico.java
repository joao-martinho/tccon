package br.furb.tccon.aluno;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlunoServico {
    
    private final AlunoRepositorio alunoRepositorio;

    public ResponseEntity<Iterable<AlunoModelo>> listarAlunos() {
        return new ResponseEntity<>(this.alunoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> cadastrarAluno(AlunoModelo alunoModelo) {
        return new ResponseEntity<>(this.alunoRepositorio.save(alunoModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<AlunoModelo> alterarAlunoTotal(String email, AlunoModelo alunoModelo) {
        Optional<AlunoModelo> optional = this.alunoRepositorio.findById(email);
        
        if (optional.isPresent()) {
            alunoModelo.setEmail(email);
            return new ResponseEntity<>(this.alunoRepositorio.save(alunoModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<AlunoModelo> alterarAlunoParcial(String email, AlunoModelo alunoModelo) {
        Optional<AlunoModelo> optional = this.alunoRepositorio.findById(email);

        if (optional.isPresent()) {
            AlunoModelo alunoModelo2 = optional.get();

            if (alunoModelo.getNome() != null) {
                alunoModelo2.setNome(alunoModelo.getNome());
            }

            if (alunoModelo.getEmail() != null) {
                alunoModelo2.setEmail(alunoModelo.getEmail());
            }

            if (alunoModelo.getSenha() != null) {
                alunoModelo2.setSenha(alunoModelo.getSenha());
            }

            if (alunoModelo.getCurso() != null) {
                alunoModelo2.setCurso(alunoModelo.getCurso());
            }

            if (alunoModelo.getCodigoDeVerificacao() != null) {
                alunoModelo2.setCodigoDeVerificacao(alunoModelo.getCodigoDeVerificacao());
            }

            if (alunoModelo.getCriadoEm() != null) {
                alunoModelo2.setCriadoEm(alunoModelo.getCriadoEm());
            }

            return new ResponseEntity<>(this.alunoRepositorio.save(alunoModelo2), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerAluno(String email) {
        boolean existeemail = this.alunoRepositorio.existsById(email);

        if (existeemail) {
            this.alunoRepositorio.deleteById(email);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        this.alunoRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> buscarAluno(String email) {
        boolean existeEmail = this.alunoRepositorio.existsById(email);

        if (existeEmail) {
            Optional<AlunoModelo> optional = this.alunoRepositorio.findById(email);

            AlunoModelo alunoModelo = optional.get();

            return new ResponseEntity<>(alunoModelo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> limparCodigoDeVerificacao() {
        alunoRepositorio.limparCodigoDeVerificacao(LocalDateTime.now().minusMinutes(10));
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
