export default function PaperStamp({ customClass = "" }: { customClass?: string }) {
    return (
      <>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-4 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11 ${customClass}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-[-3.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11 ${customClass}`}></div>
      </>
    );
  }