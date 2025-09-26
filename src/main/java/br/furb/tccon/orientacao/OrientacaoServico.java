package br.furb.tccon.orientacao;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import br.furb.tccon.professor.ProfessorModelo;
import br.furb.tccon.professor.ProfessorRepositorio;
import br.furb.tccon.termo.TermoModelo;
import br.furb.tccon.termo.TermoRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrientacaoServico {

    private final ProfessorRepositorio professorRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final TermoRepositorio termoRepositorio;

    public ResponseEntity<AlunoModelo> removerRelacaoProvisoria(String emailAluno, String emailProfessor) {
        if (emailAluno == null || emailProfessor == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String emailAlunoNorm = emailAluno.trim().toLowerCase();
        String emailProfessorNorm = emailProfessor.trim().toLowerCase();

        ProfessorModelo professor = professorRepositorio.findByEmail(emailProfessorNorm);
        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAlunoNorm);

        if (professor == null || aluno == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        boolean removido = false;

        List<String> orientandosProvisorios = professor.getOrientandosProvisorios();
        if (orientandosProvisorios != null && orientandosProvisorios.contains(emailAlunoNorm)) {
            orientandosProvisorios.remove(emailAlunoNorm);
            professor.setOrientandosProvisorios(orientandosProvisorios);
            removido = true;
        }

        List<String> coorientandosProvisorios = professor.getCoorientandosProvisorios();
        if (coorientandosProvisorios != null && coorientandosProvisorios.contains(emailAlunoNorm)) {
            coorientandosProvisorios.remove(emailAlunoNorm);
            professor.setCoorientandosProvisorios(coorientandosProvisorios);
            removido = true;
        }

        if (!removido) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        professorRepositorio.save(professor);

        if (emailProfessorNorm.equals(aluno.getOrientadorProvisorio() != null ? aluno.getOrientadorProvisorio().trim().toLowerCase() : null)) {
            aluno.setOrientadorProvisorio(null);
        } else if (emailProfessorNorm.equals(aluno.getCoorientadorProvisorio() != null ? aluno.getCoorientadorProvisorio().trim().toLowerCase() : null)) {
            aluno.setCoorientadorProvisorio(null);
        }
        alunoRepositorio.save(aluno);

        TermoModelo termoModelo = termoRepositorio.findByEmailAluno(emailAlunoNorm);
        if (termoModelo != null) {
            this.removerTermo(termoModelo.getId());
        }

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }


    public ResponseEntity<AlunoModelo> atribuirOrientadorProvisorio(String emailAluno, String emailProfessor) {
        ProfessorModelo professor = professorRepositorio.findByEmail(emailProfessor);
        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAluno);

        if (professor == null || aluno == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        List<String> orientandosProvisorios = professor.getOrientandosProvisorios();
        if (orientandosProvisorios == null) {
            orientandosProvisorios = new ArrayList<>();
        }

        if (!orientandosProvisorios.contains(emailAluno)) {
            orientandosProvisorios.add(emailAluno);
            professor.setOrientandosProvisorios(orientandosProvisorios);
            professorRepositorio.save(professor);
        }

        aluno.setOrientadorProvisorio(emailProfessor);
        alunoRepositorio.save(aluno);

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> atribuirCoorientadorProvisorio(String emailAluno, String emailProfessor) {
        ProfessorModelo professor = professorRepositorio.findByEmail(emailProfessor);
        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAluno);

        if (professor == null || aluno == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        List<String> coorientandosProvisorios = professor.getCoorientandosProvisorios();
        if (coorientandosProvisorios == null) {
            coorientandosProvisorios = new ArrayList<>();
        }

        if (!coorientandosProvisorios.contains(emailAluno)) {
            coorientandosProvisorios.add(emailAluno);
            professor.setCoorientandosProvisorios(coorientandosProvisorios);
            professorRepositorio.save(professor);
        }

        aluno.setCoorientadorProvisorio(emailProfessor);
        alunoRepositorio.save(aluno);

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }

    public void aprovarTermo(TermoModelo termoModelo2) {
        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(termoModelo2.getEmailAluno());
        alunoModelo.setOrientador(termoModelo2.getEmailOrientador());
        if (termoModelo2.getEmailCoorientador() != null) {
            alunoModelo.setCoorientador(termoModelo2.getEmailCoorientador());
        }
        this.alterarAlunoParcial(termoModelo2.getEmailAluno(), alunoModelo);

        ProfessorModelo orientador = professorRepositorio.findByEmail(termoModelo2.getEmailOrientador());
        orientador.getOrientandos().add(termoModelo2.getEmailAluno());
        this.alterarProfessorParcial(termoModelo2.getEmailOrientador(), orientador);
        if (termoModelo2.getEmailCoorientador() != null) {
            ProfessorModelo coorientador = professorRepositorio.findByEmail(termoModelo2.getEmailCoorientador());
            coorientador.getCoorientandos().add(termoModelo2.getEmailAluno());
            this.alterarProfessorParcial(termoModelo2.getEmailCoorientador(), coorientador);
        }
    }

    private ResponseEntity<Void> removerTermo(Long id) {
        boolean existeid = this.termoRepositorio.existsById(id);

        if (existeid) {
            this.termoRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    private ResponseEntity<ProfessorModelo> alterarProfessorParcial(String email, ProfessorModelo professorModelo) {
        Optional<ProfessorModelo> optional = professorRepositorio.findById(email);
        if (optional.isPresent()) {
            ProfessorModelo existente = optional.get();

            if (professorModelo.getNome() != null) {
                existente.setNome(professorModelo.getNome());
            }
            if (professorModelo.getTelefone() != null) {
                existente.setTelefone(professorModelo.getTelefone());
            }
            if (professorModelo.getOrientandos() != null) {
                existente.setOrientandos(professorModelo.getOrientandos());
            }
            if (professorModelo.getOrientandosProvisorios() != null) {
                existente.setOrientandosProvisorios(professorModelo.getOrientandosProvisorios());
            }
            if (professorModelo.getCoorientandos() != null) {
                existente.setCoorientandos(professorModelo.getCoorientandos());
            }
            if (professorModelo.getCodigoVer() != null) {
                existente.setCodigoVer(professorModelo.getCodigoVer());
            }
            if (professorModelo.getPapeis() != null && !professorModelo.getPapeis().isEmpty()) {
                existente.setPapeis(professorModelo.getPapeis());
            }

            return new ResponseEntity<>(professorRepositorio.save(existente), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    private void alterarAlunoParcial(String email, AlunoModelo alunoModelo) {
        Optional<AlunoModelo> optional = alunoRepositorio.findById(email);
        if (optional.isPresent()) {
            AlunoModelo existente = optional.get();

            if (alunoModelo.getNome() != null) {
                existente.setNome(alunoModelo.getNome());
            }
            if (alunoModelo.getTelefone() != null) {
                existente.setTelefone(alunoModelo.getTelefone());
            }
            if (alunoModelo.getOrientador() != null) {
                existente.setOrientador(alunoModelo.getOrientador());
            }
            if (alunoModelo.getCoorientador() != null) {
                existente.setCoorientador(alunoModelo.getCoorientador());
            }
            if (alunoModelo.getCurso() != null) {
                existente.setCurso(alunoModelo.getCurso());
            }
            if (alunoModelo.getCodigoVer() != null) {
                existente.setCodigoVer(alunoModelo.getCodigoVer());
            }
            if (alunoModelo.getOrientadorProvisorio() != null) {
                this.atribuirOrientadorProvisorio(email, alunoModelo.getOrientadorProvisorio());
            }

        }
    }

}
