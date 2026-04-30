import Logo from "@/components/logo";


export default function Home() {

  return (
    <div className="font-[400]">
       <h1 className="text-5xl md:text-7xl flex flex-wrap mb-4 justify-center pointer-events-none select-none border-b-4 border-dashed w-fit mx-auto">
            {'VISÃO DO OCULTO'.split("").map((char, index) => (
                <Logo key={index} char={char}/>
            ))}
        </h1>
    </div>
  );
}