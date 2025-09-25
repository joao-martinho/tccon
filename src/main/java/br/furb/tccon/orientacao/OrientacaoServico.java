package br.furb.tccon.orientacao;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import br.furb.tccon.notificacao.NotificacaoModelo;
import br.furb.tccon.notificacao.NotificacaoServico;
import br.furb.tccon.professor.ProfessorModelo;
import br.furb.tccon.professor.ProfessorRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrientacaoServico {

    private final ProfessorRepositorio professorRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final NotificacaoServico notificacaoServico;

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

        // Notificação para o professor
        NotificacaoModelo notificacaoParaProfessor = new NotificacaoModelo();
        notificacaoParaProfessor.setEmailDestinatario(emailProfessor);
        notificacaoParaProfessor.setTitulo("Orientando provisório desistiu");
        notificacaoParaProfessor.setConteudo(aluno.getNome() + " retirou sua atribuição como orientando provisório. Deseje-lhe boa sorte!");
        notificacaoServico.cadastrarMensagem(notificacaoParaProfessor);

        // Notificação para o aluno
        NotificacaoModelo notificacaoParaAluno = new NotificacaoModelo();
        notificacaoParaAluno.setEmailDestinatario(emailAluno);
        notificacaoParaAluno.setTitulo("Orientador provisório removido");
        notificacaoParaAluno.setConteudo(professor.getNome() + " não é mais seu orientador provisório, mas lhe deseja boa sorte. :)");
        notificacaoServico.cadastrarMensagem(notificacaoParaAluno);

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

        // Notificação para o aluno
        NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
        notificacaoAluno.setEmailDestinatario(emailAluno);
        notificacaoAluno.setTitulo("Orientador provisório atribuído");
        notificacaoAluno.setConteudo("Você atribuiu " + professor.getNome() + " como seu orientador provisório. Para dar o próximo passo, preencha o termo de compromisso.");
        notificacaoServico.cadastrarMensagem(notificacaoAluno);

        // Notificação para o professor
        NotificacaoModelo notificacaoProfessor = new NotificacaoModelo();
        notificacaoProfessor.setEmailDestinatario(emailProfessor);
        notificacaoProfessor.setTitulo("Novo orientando provisório");
        notificacaoProfessor.setConteudo(aluno.getNome() + " escolheu você como orientador provisório. Aguarde o envio do termo de compromisso.");
        notificacaoServico.cadastrarMensagem(notificacaoProfessor);

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }

}
