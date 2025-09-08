package br.furb.tccon.projeto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface ProjetoRepositorio extends JpaRepository<ProjetoModelo, Long> {

    List<ProjetoModelo> findByAutor(String email);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM projetos", nativeQuery = true)
    void truncateTable();

}
