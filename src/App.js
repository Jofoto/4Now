import './styles.css'
import { useEffect, useState } from 'react';
import supabase from './supabase';


function App(){
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCategory] = useState("all");
  const [userVotes, setUserVotes] = useState({});


  useEffect(() => {
    async function getFacts(){
      setIsLoading(true);

      let query = supabase.from('facts').select('*');

      if (currentCategory !== 'all') 
        query = query.eq('category', currentCategory);

      const { data: facts, error } = await query
        .order('votesheart', {ascending: false}).limit(1000);

      if(!error) setFacts(facts);
      else alert('There was a problem loading data');

      setIsLoading(false);
    }
    getFacts();
  }, [currentCategory]);

   return( 
    <>
      <Header showForm ={showForm} setShowForm={setShowForm}/>

      {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm}/> : null}
      

      <main className="main">
        <CategoryFilter setCategory = {setCategory}/>

        {isLoading ? <Loader /> : <FactList facts={facts} 
                                    setFacts={setFacts} 
                                    userVotes={userVotes}
                                    setUserVotes={setUserVotes}/>}
      </main>
    </> 
  );
}

function Loader(){
  return <p className="message">Loading...</p>
}

function Header({ showForm, setShowForm }){
  const appTitle = '4Now';
  return(
    <header className="header">
        <div className="logo">
          <img src="pixellogo.png"  alt="4Now Logo"/>
          <h1>{appTitle}</h1>
        </div>
        <button className="btn btn-large btn-share" 
              onClick={() => setShowForm((show) => !show)}>{showForm ? 'Close' : 'share a fact'}
        </button>
      </header>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3d3dfa" },
  { name: "science", color: "#008000" },
  { name: "finance", color: "#62c6ff" },
  { name: "society", color: "#ff9100" },
  { name: "entertainment", color: "#ff00c8" },
  { name: "health", color: "#13a700" },
  { name: "history", color: "#a7a400" },
  { name: "news", color: "#8400ff" },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }){
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e){
    e.preventDefault();
    console.log(text, source, category);

    if(text && isValidHttpUrl(source) && category && textLength <= 200) console.log("valid data");

    //upload new fact to db
    setIsUploading(true);
    const {data: newFact, error} = await supabase
      .from("facts")
      .insert([{text, source, category}])
      .select();
    setIsUploading(false);

    console.log("Returned data:", newFact);
    console.log("Error:", error);
   
    //add new fact to UI
    if(!error) setFacts((facts) => [newFact[0], ...facts]);

    //reset input fields after 'post'
    setText("");
    setSource("");
    setCategory("");

    //close form after 'post'
    setShowForm(false);
  }

  return (
  <form className="fact-form" onSubmit={handleSubmit}>
    <input type="text" placeholder="Share a fact with the world" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          disabled={isUploading}/>

      <span>{200 - textLength}</span>

        <input type="text"  value={source} placeholder="Trustworthy source..."
          onChange={(e) => setSource(e.target.value)}
          disabled={isUploading}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}>
            <option value="">Choose Category:</option>
          {CATEGORIES.map((category) => (
            <option key={category.name} value ={category.name}>
              {category.name.toUpperCase()}
            </option>
          ))}
        </select>
        <button className="btn btn-large" disabled={isUploading}>Post</button>
  </form>
  );
}

function CategoryFilter({ setCategory }){
  return <aside>
    <ul>
      <li className="category">
          <button className="btn btn-all"
          //default, set to all categories
          onClick={() => setCategory("all")}>All</button> 
      </li>
      {CATEGORIES.map((category) => 
        <li key={category.name} className="category">
          <button className="btn btn-category" 
          //set to certain category
          onClick={() => setCategory(category.name)}
            style={{backgroundColor: category.color}}>
            {category.name}</button>
      </li>)}
    </ul>
  </aside>;
}

function FactList({ facts, setFacts, userVotes, setUserVotes }){
  //if there are no facts in a category
  if(facts.length === 0)
    return(
      <p className="message">There are no facts in this category 4 now. Create the first one!🦄</p>
    );

  return (
  <section>
    <ul className="facts-list">{
      facts.map((fact) => 
        <Fact key={fact.id} fact={fact} 
          setFacts={setFacts} 
          userVotes={userVotes}
          setUserVotes={setUserVotes}/>
      )}
    </ul>
    <p>4 now, there are {facts.length} facts in the database. Add your own!</p>
  </section>
  )}

function Fact({ fact, setFacts, userVotes, setUserVotes }){
  const [isUpdating, setIsUpdating] = useState(false);
  const userVote = userVotes[fact.id]; // 💗/🐸/👿
  const isDisputed = fact.votesheart + fact.votesfrog < fact.votesno;

  async function handleVote(vote){
    if (isUpdating) return;

    let updates = {};
    let newVote = userVote;

    //undo vote if same button is clicked again
    if (userVote === vote) {
      updates[vote] = fact[vote] - 1;
      newVote = null;
    } else {
      //remove previous vote (if any)
      if (userVote) {
        updates[userVote] = fact[userVote] - 1;
      }
      //add new vote
      updates[vote] = (updates[vote] ?? fact[vote]) + 1;
      newVote = vote;
    }

    setIsUpdating(true);
    const {data: updatedFact, error} = await supabase
      .from('facts')
      .update(updates)
      .eq('id', fact.id)
      .select();
    setIsUpdating(false);

      console.log(updatedFact);

      if(!error){ 
        setFacts((facts) => facts.map((f) => f.id === fact.id ? updatedFact[0] : f));
        setUserVotes((prev) => ({
          ...prev,
          [fact.id]: newVote,
        })); //prev: previous state of userVotes
      }
  }
  
  return (
    <li className="fact">
    <p>
        {isDisputed ? <span className="disputed">[🤨DISPUTED] </span> : null}
        {fact.text} 
        <a className="source" href={fact.source} target="_blank"> (Source)</a> 
    </p>
    <span className="tag" style={{
          backgroundColor: CATEGORIES.find((category) => 
          category.name === fact.category).color
          }}>{fact.category}
    </span>
    <div className="vote-buttons">
        <button onClick={() => handleVote('votesheart')} disabled={isUpdating}>💗{fact.votesheart}</button>
        <button onClick={() => handleVote('votesfrog')} disabled={isUpdating}>🐸{fact.votesfrog}</button>
        <button onClick={() => handleVote('votesno')} disabled={isUpdating}>👿{fact.votesno}</button>
    </div>
  </li>
)}

export default App;
