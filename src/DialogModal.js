import {useEffect, useRef } from "react";

const isClickInsideRectangle = (e, element) => {

    const r = element.getBoundingClientRect();
  
    return (
      e.clientX > r.left &&
      e.clientX < r.right &&
      e.clientY > r.top &&
      e.clientY < r.bottom
    );
};

export const DialogModal = ({onProceed,onClose,children}) =>{
    const ref = useRef();

    useEffect(() => {
        ref.current?.showModal();
        
      }, [ref]);

    // useEffect(()=>{
    //     document.querySelector("dialog").showModal()
    // },[])


    return(
        <dialog
            ref={ref}
            onCancel={onClose}
            onClick={(e) =>
                ref.current && !isClickInsideRectangle(e, ref.current) && onClose()
            }
        >
            {children}

            <div className="diButtons">
                <button onClick={onProceed}>Yes</button>
                <button onClick={onClose}>Cancel</button>
            </div>
                
       
        </dialog>
    )    
}