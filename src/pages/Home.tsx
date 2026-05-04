import Logo from "@/components/logo";


export default function Home() {

  return (
    <div className="font-[400] flex flex-col items-center justify-between h-full w-full">
      <div>
        <h1 className="text-5xl md:text-7xl flex flex-wrap mb-4 justify-center pointer-events-none select-none border-b-4 border-dashed w-fit mx-auto">
            {'VISÃO DO OCULTO'.split("").map((char, index) => (
                <Logo key={index} char={char}/>
            ))}
        </h1>
        <p className=" text-center mt-6">
          Visão do Oculto é um projeto pessoal meu, com o objetivo de unificar todo o material de Ordem Paranormal em um local só.<br/>
          Pra que habilidades do livro base, suplemento, revista ou marcador de página sejam encontrados no mesmo local.
        </p>  
      </div>
      <div className="w-4/5 mx-auto">
        <input className="border-2 border-gray-400/30 bg-gray-400/30 py-2 px-4 w-full focus:outline-none focus:border-gray-500/50 focus:bg-gray-400/40" placeholder="Pesquisar...">
        </input>
      </div>
      <div className="w-4/5 flex flex-col gap-6">
        <div className="bg-gray-400/10 px-40 p-6">
          <p className="font-bold uppercase font-daisy tracking-tight mx-auto text-xl">
            Lista de atualizações:
          </p>
          <p className="border-b border-gray-400">
            <span className="font-bold">v0.1</span> <span className="text-gray-500">(04/05/26)</span> - Iniciado o desenvolvimento.
          </p>
        </div>
        <div className="bg-gray-400/10 px-40 p-6">
          <p className="font-bold uppercase font-daisy tracking-tight mx-auto text-xl">
            Funcionalidades planejadas:
          </p>
          <ul className="list-disc list-inside">
            <li className="border-b border-gray-400">Adicionar leitura das fontes</li>
            <li className="border-b border-gray-400">Implementar sistema de favoritos</li>
            <li className="border-b border-gray-400">Adicionar regras do sistema</li>
          </ul>
        </div>  
      </div>
      
      
      
      <p className=" text-center mt-6 p-4 border-2 border-gray-500 border-dashed rounded-lg text-gray-600 uppercase font-daisy tracking-tight w-fit mx-auto">
      Todo o conteúdo original de Ordem Paranormal pertence à Jambô Editora e ao universo criado por Cellbit. <br/>
      O Visão do Oculto foi desenvolvido para servir como uma referência digital de consulta rápida para materiais e produtos que você já possui.<br/>
      Este projeto não substitui a compra dos livros oficiais e não tem qualquer vínculo com a Jambô Editora ou com os criadores da marca Ordem Paranormal.
      </p>
    </div>
  );
}