package br.furb.tccon.termo;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.tccon.banca.BancaServico;
import br.furb.tccon.notificacao.NotificacaoModelo;
import br.furb.tccon.notificacao.NotificacaoServico;
import br.furb.tccon.orientacao.OrientacaoServico;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TermoServico {

    private final OrientacaoServico orientacaoServico;  
    private final TermoRepositorio termoRepositorio;
    private final NotificacaoServico notificacaoServico;
    private final BancaServico bancaServico;

    public ResponseEntity<Iterable<TermoModelo>> listarTermos() {
        return new ResponseEntity<>(this.termoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<TermoModelo> cadastrarTermo(TermoModelo termoModelo) {
        TermoModelo salvo = this.termoRepositorio.save(termoModelo);

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

    public ResponseEntity<TermoModelo> alterarTermoParcial(Long id, TermoModelo termoModelo) {
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

            if (termoModelo.getStatus() != null) {
                termoModelo2.setStatus(termoModelo.getStatus());

                String tituloAluno = termoModelo2.getStatus().equals("aprovado") ?
                    "Termo aprovado" : "Termo rejeitado";
                String conteudoAluno = termoModelo2.getStatus().equals("aprovado") ?
                    "O seu termo de compromisso foi aprovado." :
                    "O seu termo de compromisso foi rejeitado. Procure o seu orientador.";

                NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
                notificacaoAluno.setEmailDestinatario(termoModelo2.getEmailAluno());
                notificacaoAluno.setTitulo(tituloAluno);
                notificacaoAluno.setConteudo(conteudoAluno);
                notificacaoServico.cadastrarMensagem(notificacaoAluno);

                if (termoModelo2.getStatus().equals("aprovado")) {
                   orientacaoServico.aprovarTermo(termoModelo2);
                } 
                
            }

            TermoModelo salvo = this.termoRepositorio.save(termoModelo2);

            if (termoModelo2.getStatus().equals("aprovado")) {
                bancaServico.criarAPartirDoTermo(salvo);
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

    

}
