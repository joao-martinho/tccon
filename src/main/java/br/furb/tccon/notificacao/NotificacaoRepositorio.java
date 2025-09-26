package br.furb.tccon.notificacao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface NotificacaoRepositorio extends JpaRepository<NotificacaoModelo, Long> {

    List<NotificacaoModelo> findByEmailDestinatario(String email);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM notificacoes", nativeQuery = true)
    void truncateTable();
}

