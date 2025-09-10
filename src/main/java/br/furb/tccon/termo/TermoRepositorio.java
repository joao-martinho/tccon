package br.furb.tccon.termo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface TermoRepositorio extends JpaRepository<TermoModelo, Long> {

    TermoModelo findByEmailDoAluno(String email);
    List<TermoModelo> findByEmailDoOrientador(String email);
    List<TermoModelo> findByEmailDoCoorientador(String email);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM termos", nativeQuery = true)
    void truncateTable();

}
