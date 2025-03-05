import { useEffect, useRef } from 'react';

/**
 * Custom hook that detects clicks outside of the specified element
 * 
 * @param {Function} callback - Function to call when a click outside is detected
 * @param {Array} dependencies - Dependencies array for the useEffect hook
 * @returns {React.RefObject} - Ref to attach to the element you want to detect clicks outside of
 * 
 * @example
 * // In a component:
 * const modalRef = useClickOutside(() => setIsOpen(false), [isOpen]);
 * 
 * return (
 *   <div ref={modalRef} className="modal">
 *     Modal content that will not trigger the callback when clicked
 *   </div>
 * );
 */
const useClickOutside = (callback, dependencies = []) => {
  const ref = useRef(null);

  useEffect(() => {
    /**
     * Handle document click event
     * @param {MouseEvent} event - The click event
     */
    const handleClickOutside = (event) => {
      // Check if the ref exists and if the click was outside the referenced element
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener on component unmount or when dependencies change
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
};

export default useClickOutside;