package br.furb.tccon.orientacao;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.aluno.AlunoRepositorio;
import br.furb.tccon.notificacao.NotificacaoModelo;
import br.furb.tccon.notificacao.NotificacaoServico;
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
    private final NotificacaoServico notificacaoServico;

    public ResponseEntity<AlunoModelo> removerRelacaoProvisoria(String emailAluno, String emailSolicitante) {
        if (emailAluno == null || emailSolicitante == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String emailAlunoNorm = emailAluno.trim().toLowerCase();
        String emailSolicitanteNorm = emailSolicitante.trim().toLowerCase();

        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAlunoNorm);
        if (aluno == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        ProfessorModelo orientador = aluno.getOrientadorProvisorio() != null ?
                professorRepositorio.findByEmail(aluno.getOrientadorProvisorio().trim().toLowerCase()) : null;

        ProfessorModelo coorientador = aluno.getCoorientadorProvisorio() != null ?
                professorRepositorio.findByEmail(aluno.getCoorientadorProvisorio().trim().toLowerCase()) : null;

        boolean solicitanteEhAluno = emailSolicitanteNorm.equals(emailAlunoNorm);
        boolean solicitanteEhOrientador = orientador != null && emailSolicitanteNorm.equals(orientador.getEmail());
        boolean solicitanteEhCoorientador = coorientador != null && emailSolicitanteNorm.equals(coorientador.getEmail());

        if (solicitanteEhAluno || solicitanteEhOrientador) {
            if (orientador != null) {
                List<String> orientandosProvisorios = orientador.getOrientandosProvisorios();
                if (orientandosProvisorios != null) orientandosProvisorios.remove(emailAlunoNorm);
                orientador.setOrientandosProvisorios(orientandosProvisorios);
                professorRepositorio.save(orientador);
            }

            if (coorientador != null) {
                List<String> coorientandosProvisorios = coorientador.getCoorientandosProvisorios();
                if (coorientandosProvisorios != null) coorientandosProvisorios.remove(emailAlunoNorm);
                coorientador.setCoorientandosProvisorios(coorientandosProvisorios);
                professorRepositorio.save(coorientador);
            }

            aluno.setOrientadorProvisorio(null);
            aluno.setCoorientadorProvisorio(null);
        }
        else if (solicitanteEhCoorientador && coorientador != null) {
            List<String> coorientandosProvisorios = coorientador.getCoorientandosProvisorios();
            if (coorientandosProvisorios != null) coorientandosProvisorios.remove(emailAlunoNorm);
            coorientador.setCoorientandosProvisorios(coorientandosProvisorios);
            professorRepositorio.save(coorientador);

            aluno.setCoorientadorProvisorio(null);
        }
        else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        alunoRepositorio.save(aluno);

        TermoModelo termoModelo = termoRepositorio.findByEmailAluno(emailAlunoNorm);
        if (termoModelo != null) {
            this.removerTermo(termoModelo.getId());
        }

        if (solicitanteEhAluno || solicitanteEhOrientador) {
            if (orientador != null) {
                notificacaoServico.cadastrarMensagem(criarNotificacaoProfessor(aluno, orientador, "orientando"));
            }
            if (coorientador != null) {
                notificacaoServico.cadastrarMensagem(criarNotificacaoProfessor(aluno, coorientador, "coorientando"));
            }
            notificacaoServico.cadastrarMensagem(criarNotificacaoAluno(aluno, orientador, coorientador));
        } else if (solicitanteEhCoorientador) {
            notificacaoServico.cadastrarMensagem(criarNotificacaoAluno(aluno, null, coorientador));
            notificacaoServico.cadastrarMensagem(criarNotificacaoProfessor(aluno, coorientador, "coorientando"));
        }

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }

    private NotificacaoModelo criarNotificacaoProfessor(AlunoModelo aluno, ProfessorModelo professor, String tipo) {
        NotificacaoModelo n = new NotificacaoModelo();
        n.setEmailDestinatario(professor.getEmail());
        if ("orientando".equals(tipo)) {
            n.setTitulo("Orientando removido");
            n.setConteudo(aluno.getNome() + " não é mais seu orientando provisório. Deseje-lhe boa sorte. 😉");
        } else if ("coorientando".equals(tipo)) {
            n.setTitulo("Coorientando removido");
            n.setConteudo(aluno.getNome() + " não é mais seu coorientando provisório. Deseje-lhe boa sorte. 😉");
        }
        return n;
    }

    private NotificacaoModelo criarNotificacaoAluno(AlunoModelo aluno, ProfessorModelo orientador, ProfessorModelo coorientador) {
        NotificacaoModelo n = new NotificacaoModelo();
        n.setEmailDestinatario(aluno.getEmail());
        String conteudo = "";
        if (orientador != null) {
            n.setTitulo("Orientador removido");
            conteudo += orientador.getNome() + " não é mais seu orientador provisório, mas lhe deseja boa sorte. 😉\n";
        }
        if (coorientador != null) {
            n.setTitulo("Coorientador removido");
            conteudo += coorientador.getNome() + " não é mais seu coorientador provisório, mas lhe deseja boa sorte. 😉";
        }
            
        n.setConteudo(conteudo);
        return n;
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

        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(emailAluno);
        ProfessorModelo professorModelo = professorRepositorio.findByEmail(emailProfessor);

        NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
        notificacaoAluno.setEmailDestinatario(emailAluno);
        notificacaoAluno.setTitulo("Orientador provisório escolhido");
        notificacaoAluno.setConteudo("Você escolheu " + professorModelo.getNome() + " como seu orientador provisório. Agora é o momento de preencher o termo de compromisso.");
        notificacaoServico.cadastrarMensagem(notificacaoAluno);

        NotificacaoModelo notificacaoProfessor = new NotificacaoModelo();
        notificacaoProfessor.setEmailDestinatario(emailProfessor);
        notificacaoProfessor.setTitulo("Você é um orientador provisório!");
        notificacaoProfessor.setConteudo(alunoModelo.getNome() + " escolheu você como orientador provisório. Aguarde o recebimento do termo de compromisso.");
        notificacaoServico.cadastrarMensagem(notificacaoProfessor);

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

        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(emailAluno);

        NotificacaoModelo notificacaoProfessor = new NotificacaoModelo();
        notificacaoProfessor.setEmailDestinatario(emailProfessor);
        notificacaoProfessor.setTitulo("Você é um coorientador provisório!");
        notificacaoProfessor.setConteudo(alunoModelo.getNome() + " escolheu você como coorientador provisório. Aguarde o recebimento do termo de compromisso.");
        notificacaoServico.cadastrarMensagem(notificacaoProfessor);

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
