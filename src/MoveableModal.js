import {useEffect, useRef,cloneElement } from "react"

    

export const MovableModal = ({children,id,title,setShowModal,maxZ,setMaxZ}) => {

    const dragElement = (e,element) =>{
        
        element.style['z-index'] = maxZ+1
        setMaxZ(maxZ+1)
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const elementDrag = (e) => {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            if(element.offsetTop - pos2>=0){
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
            }
            
        }

        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        const dragMouseDown = (e) => {

            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement
            document.onmousemove = elementDrag
        }

        dragMouseDown(e)

    }

    const ref = useRef()
    const refBtn = useRef()

    useEffect(()=>{
        if(ref.current){
            ref.current.style['z-index'] = maxZ+1
            setMaxZ(maxZ+1)
        }
    },[ref])

    return(
      
        <div className="trWindow" 
            ref={ref} 
            id={id}
            onClick = {()=>{
                ref.current.style['z-index'] = maxZ+1;
                setMaxZ(maxZ+1)
            }}
            onScroll={()=>{

                refBtn.current.style.top = ref.current.scrollTop + "px"
            }}    
        >
            <div
                onMouseDown={(e)=>ref.current && dragElement(e,ref.current)}
                className="trWindowDiv"
            >
                {cloneElement(title,{className:"trWindowHeader"})}
            </div>

            {children}

            <button
                ref={refBtn} 
                className="formClose" 
                onClick={()=>setShowModal(false)}
            >
                x
            </button>

        </div>

        
 
    )
}

