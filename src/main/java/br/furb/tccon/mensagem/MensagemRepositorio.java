package br.furb.tccon.mensagem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface MensagemRepositorio extends JpaRepository<MensagemModelo, Long> {
    
    MensagemModelo findByEmailDestinatario(String email);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM mensagens", nativeQuery = true)
    void truncateTable();

}
