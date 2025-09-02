package br.furb.tccon.relatorio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface RelatorioRepositorio extends JpaRepository<RelatorioModelo, Long> {

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM relatorios", nativeQuery = true)
    void truncateTable();
    
}
