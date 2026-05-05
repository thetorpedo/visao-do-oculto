

export default function Origens() {

  return (
    <div className="font-[400] grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className='w-full bg-white/50 shadow-sm p-5'>
      <div className="text-2xl font-special underline mb-2">
        Agente de Saúde
      </div>
      <div>
        <p className="text-sm text-gray-800 text-justify">
          Você era um profissional da saúde, como um enfermeiro, farmacêutico, médico, psicólogo ou socorrista, treinado no atendimento e cuidado de pessoas. Você pode ter sido surpreendido por um evento paranormal durante o trabalho ou mesmo cuidado de um agente da Ordem em uma emergência, que ficou surpreso com o quão bem você lidou com a situação. 
        </p>
        
      </div>
      <div className="mt-4 p-4 pb-3 border-2 border-dashed border-gray-400 ">
        <div className="font-special text-base bg-gray-300/50 p-1 pb-0.5 ">
          Perícias treinadas:
        </div>
        <div className="font-special mt-2 px-2">
          Intuição e Medicina.
        </div> 
      </div>
      <div className="p-4 bg-linear-0 from-amber-200/70 to-amber-400/70 mt-4 shadow-md/20 backface-hidden"> 
        <div className="font-special text-sm">
          Técnica Medicinal:
        </div>
        <div className="text-justify text-sm">
          Sempre que cura um personagem, você adiciona seu Intelecto no total de PV curados.
        </div>
      </div>
      
      </div>
    </div>
  );
}