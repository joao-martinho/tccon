package br.furb.tccon.termo;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.banca.BancaServico;
import br.furb.tccon.notificacao.NotificacaoModelo;
import br.furb.tccon.notificacao.NotificacaoServico;
import br.furb.tccon.professor.ProfessorModelo;
import br.furb.tccon.professor.ProfessorRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TermoServico {
    
    private final TermoRepositorio termoRepositorio;
    private final BancaServico bancaServico;
    private final ProfessorRepositorio professorRepositorio;
    private final NotificacaoServico notificacaoServico;

    public ResponseEntity<Iterable<TermoModelo>> listarTermos() {
        return new ResponseEntity<>(this.termoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<TermoModelo> cadastrarTermo(TermoModelo termoModelo) {
        TermoModelo salvo = this.termoRepositorio.save(termoModelo);

        NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
        notificacaoAluno.setEmailDestinatario(termoModelo.getEmailAluno());
        notificacaoAluno.setTitulo("Termo de compromisso enviado");

        ProfessorModelo orientador = professorRepositorio.findByEmail(termoModelo.getEmailOrientador());

        if (termoModelo.getEmailCoorientador() != null) {
            ProfessorModelo coorientador = professorRepositorio.findByEmail(termoModelo.getEmailCoorientador());
            notificacaoAluno.setConteudo(
                "O seu termo de compromisso foi enviado a " + orientador.getNome() + " e " + 
                coorientador.getNome() + ". Aguarde a resposta."
            );
            notificacaoServico.cadastrarMensagem(notificacaoAluno);
        }
        else {
             notificacaoAluno.setConteudo(
                "O seu termo de compromisso foi enviado a " + orientador.getNome() + ". Aguarde a resposta."
            );
            notificacaoServico.cadastrarMensagem(notificacaoAluno);
        }      

        NotificacaoModelo notificacaoOrientador = new NotificacaoModelo();
        notificacaoOrientador.setEmailRemetente(termoModelo.getEmailAluno());
        notificacaoOrientador.setEmailDestinatario(termoModelo.getEmailOrientador());
        notificacaoOrientador.setTitulo("Termo de compromisso recebido");
        notificacaoOrientador.setConteudo(
            "Você recebeu um termo de compromisso de " + termoModelo.getNomeAluno() + ". Ele ou ela aguarda a sua resposta."
        );
        notificacaoServico.cadastrarMensagem(notificacaoOrientador);

        if (termoModelo.getEmailCoorientador() != null) {
            NotificacaoModelo notificacaoCoorientador = new NotificacaoModelo();
            notificacaoCoorientador.setEmailRemetente(termoModelo.getEmailAluno());
            notificacaoCoorientador.setEmailDestinatario(termoModelo.getEmailCoorientador());
            notificacaoCoorientador.setTitulo("Termo de compromisso recebido");
            notificacaoCoorientador.setConteudo(
                "Você recebeu um termo de compromisso de " + termoModelo.getNomeAluno() + ". Ele ou ela aguarda a sua resposta."
            );
            notificacaoServico.cadastrarMensagem(notificacaoCoorientador);
        }

        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
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

            if (termoModelo.getEmailAluno() != null) {
                termoModelo2.setEmailAluno(termoModelo.getEmailAluno());
            }

            if (termoModelo.getNomeAluno() != null) {
                termoModelo2.setNomeAluno(termoModelo.getNomeAluno());
            }

            if (termoModelo.getTelefoneAluno() != null) {
                termoModelo2.setTelefoneAluno(termoModelo.getTelefoneAluno());
            }

            if (termoModelo.getCursoAluno() != null) {
                termoModelo2.setCursoAluno(termoModelo.getCursoAluno());
            }

            if (termoModelo.getEmailOrientador() != null) {
                termoModelo2.setEmailOrientador(termoModelo.getEmailOrientador());
            }

            if (termoModelo.getPerfilCoorientador() != null) {
                termoModelo2.setPerfilCoorientador(termoModelo.getPerfilCoorientador());
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

            if (termoModelo.getCriadoEm() != null) {
                termoModelo2.setCriadoEm(termoModelo.getCriadoEm());
            }

            if (termoModelo.getStatusOrientador() != null && email.equals(termoModelo2.getEmailOrientador())) {
                termoModelo2.setStatusOrientador(termoModelo.getStatusOrientador());
            }

            if (termoModelo.getStatusCoorientador() != null && email.equals(termoModelo2.getEmailCoorientador())) {
                termoModelo2.setStatusCoorientador(termoModelo.getStatusCoorientador());
            }

            if (termoModelo2.getEmailCoorientador() != null) {
                    termoModelo2.setStatusFinal(this.getStatusFinal(
                    termoModelo2.getStatusOrientador(), 
                    termoModelo2.getStatusCoorientador()
                ));
            }
            else {
                termoModelo2.setStatusFinal(termoModelo2.getStatusOrientador());
            }

            TermoModelo salvo = this.termoRepositorio.save(termoModelo2);

            if (termoModelo2.getStatusFinal().equals("aprovado")) {
                bancaServico.criarAPartirDoTermo(salvo);
            }

            if (termoModelo2.getStatusFinal().equals("aprovado") || termoModelo2.getStatusFinal().equals("rejeitado")) {

                String tituloAluno = termoModelo2.getStatusFinal().equals("aprovado") ?
                    "Termo aprovado" : "Termo rejeitado";
                String conteudoAluno = termoModelo2.getStatusFinal().equals("aprovado") ?
                    "O seu termo de compromisso foi aprovado." :
                    "O seu termo de compromisso foi rejeitado. Procure o seu orientador.";

                NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
                notificacaoAluno.setEmailDestinatario(termoModelo2.getEmailAluno());
                notificacaoAluno.setTitulo(tituloAluno);
                notificacaoAluno.setConteudo(conteudoAluno);
                notificacaoServico.cadastrarMensagem(notificacaoAluno);

                NotificacaoModelo notificacaoOrientador = new NotificacaoModelo();
                notificacaoOrientador.setEmailDestinatario(termoModelo2.getEmailOrientador());
                notificacaoOrientador.setTitulo("Atualização do termo de compromisso");
                notificacaoOrientador.setConteudo(
                    "O termo de compromisso de " + termoModelo2.getNomeAluno() +
                    " foi " + termoModelo2.getStatusFinal() + "."
                );
                notificacaoServico.cadastrarMensagem(notificacaoOrientador);

                if (termoModelo2.getEmailCoorientador() != null) {
                    NotificacaoModelo notificacaoCoorientador = new NotificacaoModelo();
                    notificacaoCoorientador.setEmailDestinatario(termoModelo2.getEmailCoorientador());
                    notificacaoCoorientador.setTitulo("Atualização do termo de compromisso");
                    notificacaoCoorientador.setConteudo(
                        "O termo de compromisso de " + termoModelo2.getNomeAluno() +
                        " foi " + termoModelo2.getStatusFinal() + "."
                    );
                    notificacaoServico.cadastrarMensagem(notificacaoCoorientador);
                }

            }

            return new ResponseEntity<>(salvo, HttpStatus.OK);

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

    public ResponseEntity<TermoModelo> buscarPorEmailAluno(String email) {
        TermoModelo termoModelo = this.termoRepositorio.findByEmailAluno(email);

        return new ResponseEntity<>(termoModelo, HttpStatus.OK);
    }

    public ResponseEntity<List<TermoModelo>> buscarPorEmailProfessor(String email) {
        List<TermoModelo> termoModelos = this.termoRepositorio.findByEmailOrientador(email);
        termoModelos.addAll(this.termoRepositorio.findByEmailCoorientador(email));

        return new ResponseEntity<>(termoModelos, HttpStatus.OK);
    }

    private String getStatusFinal(String statusOrientador, String statusCoorientador) {
        if ("aprovado".equals(statusOrientador) && "aprovado".equals(statusCoorientador)) {
            return "aprovado";
        } else if ("rejeitado".equals(statusOrientador) || "rejeitado".equals(statusCoorientador)) {
            return "rejeitado";
        } else {
            return "pendente";
        }
    }

}
