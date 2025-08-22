@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // coincide com o vínculo da FURB
    private Long id;
    
    private String nome;
    private String email;
    private String senha;
    
    @Enumerated(EnumType.STRING)
    private Papel papel;
}
