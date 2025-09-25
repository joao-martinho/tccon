package br.furb.tccon.orientacao;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import br.furb.tccon.professor.ProfessorModelo;
import br.furb.tccon.professor.ProfessorRepositorio;
import br.furb.tccon.termo.TermoModelo;
import br.furb.tccon.termo.TermoRepositorio;
import br.furb.tccon.termo.TermoServico;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrientacaoServico {

    private final ProfessorRepositorio professorRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final TermoRepositorio termoRepositorio;
    private final TermoServico termoServico;

    /**
     * Remove a relação de orientação provisória entre professor e aluno,
     * atualiza os dados e envia notificações para ambos.
     * 
     * @param emailAluno
     * @param emailProfessor
     * @return ResponseEntity com o aluno atualizado ou NOT_FOUND
     */
    public ResponseEntity<AlunoModelo> removerRelacaoProvisoria(String emailAluno, String emailProfessor) {
        ProfessorModelo professor = professorRepositorio.findByEmail(emailProfessor);
        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAluno);

        if (professor == null || aluno == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        List<String> orientandosProvisorios = professor.getOrientandosProvisorios();
        if (orientandosProvisorios == null || !orientandosProvisorios.contains(emailAluno)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Remove o aluno da lista de orientandos provisórios do professor
        orientandosProvisorios.remove(emailAluno);
        professor.setOrientandosProvisorios(orientandosProvisorios);
        professorRepositorio.save(professor);

        // Remove o orientador provisório do aluno se for esse professor
        if (emailProfessor.equals(aluno.getOrientadorProvisorio())) {
            aluno.setOrientadorProvisorio(null);
            alunoRepositorio.save(aluno);
        }

        TermoModelo termoModelo = termoRepositorio.findByEmailAluno(emailAluno);

        if (termoModelo != null) {
            termoServico.removerTermo(termoModelo.getId());
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

}
