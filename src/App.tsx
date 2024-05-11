import { useState, useEffect, useRef } from 'react'

import './App.css'
import Pill from './components/Pill';

//Pending             

// -Add debouncing
// -Fix position of suggestion list
// -On up and doen key user should traverse through suggestions


interface UserProps {
  firstName: string,
  lastName: string,
  image: string,
  email: string,
  id: number

}
function App() {

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<UserProps[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProps[]>([]);
  const [selectedUsersSet, setSelectedUsersSet] = useState(new Set()); // Set used to faster search
  const [focussedSuggestionIndex, setFocussedSuggestionIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const URL = 'https://dummyjson.com/users/search?q='


  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.trim() === '') setSuggestions([]);

      else {
        try {
          const response = await fetch(`${URL + searchTerm}`);
          console.log(response);

          if (!response.ok) {
            throw new Error('Fetch failed');
          }
          const data = await response.json();
          console.log('data:', data);
          setSuggestions(data.users);
        }

        catch (error) {
          console.error('error: ', error);
        }
        finally {
          setFocussedSuggestionIndex(-1);
        }
      }
    }
    { if (timerRef.current) { clearTimeout(timerRef.current) } }
    timerRef.current = setTimeout(fetchUsers, 750); // debouncing

    return () => { if (timerRef.current) { clearTimeout(timerRef.current) } }
  }, [searchTerm])

  const handleSelected = (user: UserProps) => {
    console.log('selcted: ', selectedUsers);

    setSelectedUsers([...selectedUsers, user]);
    setSelectedUsersSet(new Set([...selectedUsersSet, user.email]));
    setSearchTerm('');
    setSuggestions([]);
    setFocussedSuggestionIndex(-1);
    inputRef?.current?.focus();

  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value)
  }

  const handleRemoveUser = (user: UserProps) => {

    const newUsers = selectedUsers.filter(selectedUser => selectedUser.id !== user.id);
    setSelectedUsers(newUsers);
    // setSelectedUsersSet(new Set (newUsers.map(user=>user.email)));

    const updatedEmails = new Set(selectedUsersSet);
    updatedEmails.delete(user.email);
    setSelectedUsersSet(updatedEmails);

    setFocussedSuggestionIndex(-1);

  }

  // console.log(selectedUsersSet);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement && e.target.value === '' && selectedUsers.length > 0 && e.key === 'Backspace') {
      const userToBeRemoved = selectedUsers[selectedUsers.length - 1];
      handleRemoveUser(userToBeRemoved);
      setSuggestions([]);
    }

    else if (suggestions.length && e.key === "ArrowDown") {
      setFocussedSuggestionIndex(prevIndex => Math.min(suggestions.length - 1, prevIndex + 1))

    }

    else if (suggestions.length && e.key === "ArrowUp") {
      setFocussedSuggestionIndex(prevIndex => Math.max(0, prevIndex - 1))

    }
    else if (e.key === 'Enter' && focussedSuggestionIndex >= 0 && focussedSuggestionIndex < suggestions.length) {
      const focussedUser = suggestions[focussedSuggestionIndex];
      handleSelected(focussedUser);
    }
  }

  return (
    <div className='user-search-container'>
      <div className="user-search-input">
        {/* Pills */}
        {selectedUsers.map((user) => (
          <Pill onClick={() => handleRemoveUser(user)} image={user.image} text={`${user.firstName} ${user.lastName}`} />
        ))}
        <div>
          <input
            ref={inputRef}
            type='text'
            placeholder='Search a user ...'
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}

          />

          <ul className="suggestions-list">
            {suggestions
              ?.filter(item => !selectedUsersSet.has(item.email))
              ?.map((user, index) => {
                // console.log('focussedd: ', focussedSuggestionIndex);
                // console.log('index: ', index);
                return (
                  <li key={user.email} onClick={() => handleSelected(user)} className={`${focussedSuggestionIndex === index ? 'focus' : ''}`}>
                    <img src={user.image} alt={`${user.firstName} '-' ${user.lastName}`} />
                    <span>{user.firstName + ' ' + user.lastName}</span>
                  </li>
                )

              })}
          </ul>
        </div>
      </div>

    </div>

  )
}

export default App
