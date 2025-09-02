package br.furb.tccon.autenticacao;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import br.furb.tccon.dto.CredenciaisDTO;
import br.furb.tccon.professor.ProfessorModelo;
import br.furb.tccon.professor.ProfessorRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AutenticacaoServico {

    private final AlunoRepositorio alunoRepositorio;
    private final ProfessorRepositorio professorRepositorio;

    public ResponseEntity<?> login(CredenciaisDTO credenciais) {

        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(credenciais.getEmail());
        if (alunoModelo != null && alunoModelo.getSenha().equals(credenciais.getSenha())) {
            return ResponseEntity.ok("Aluno autenticado: " + alunoModelo.getNome());
        }

        ProfessorModelo professorModelo = professorRepositorio.findByEmail(credenciais.getEmail());
        if (professorModelo != null && professorModelo.getSenha().equals(credenciais.getSenha())) {
            return ResponseEntity.ok("Professor autenticado: " + professorModelo.getNome());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas!");
    }
}
