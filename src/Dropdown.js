import { useEffect, useState, useRef,cloneElement } from "react"

const useOutsideClick = (callback) => {
    const ref1 = useRef();
    const ref2 = useRef();
  
    useEffect(() => {
        const handleClick = (event) => {
          if (ref1.current && !ref1.current.contains(event.target)
          && ref2.current && !ref2.current.contains(event.target)) {
            callback();
          }
        };

        document.addEventListener('click', handleClick,true);

        return () => {
          document.removeEventListener('click', handleClick,true);
        };
      }, [ref1,ref2]);

      return [ref1,ref2];
};

export const Dropdown = ({id,trigger,menu,menuId}) => {

    const [showAccMenu,setShowAccMenu] = useState(false)
    const handleClickOutside = () => {
        setShowAccMenu(false);
    };
    let ref1,ref2
    [ref1,ref2] = useOutsideClick(handleClickOutside);

    const handleAccMenu = () => {
        setShowAccMenu(!showAccMenu);
    };

    return(
        <div id={id}>

            
            {
                cloneElement(
                    trigger,
                    {
                        onClick:handleAccMenu,
                        ref:ref2
                    }
                )
            }
    
            {
                showAccMenu &&
                <div id={menuId} ref={ref1}>
                    {
                        menu.map((menuItem,index)=>(
                            menuItem.type==='button'?
                            cloneElement(menuItem,{
                                onClick: (e) =>{
                                    menuItem.props.onClick();
                                    setShowAccMenu(false)
                                },
                                key:index
                            }):
                            cloneElement(menuItem,{
                                key:index
                            })
                        ))
                    }
                </div>
            }

        </div>

        
    )

}