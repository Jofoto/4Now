import './styles.css'
import { useState } from "react";

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesheart: 24,
    votesfrog: 9,
    voteno: 4,
    createdIn: 2021
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesheart: 11,
    votesfrog: 2,
    voteno: 0,
    createdIn: 2019
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesheart: 8,
    votesfrog: 3,
    votesno: 1,
    createdIn: 2015
  }
];

// function Counter(){
//   const [count, setCount] = useState(0)

//   return (
//     <div>
//     <span style={{fontSize: '40px'}}>
//       {count}
//     </span>
//     <button className="btn btn-large" onClick={() => setCount((c) => c + 1)}>
//       +1
//     </button>
//   </div>
//   )
// }

function App(){
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState(initialFacts);

   return( 
    <>
      <Header showForm ={showForm} setShowForm={setShowForm}/>
    
      {/* <Counter/> */}
      {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm}/> : null}
      

      <main className="main">
        <CategoryFilter/>
        <FactList facts={facts}/>
      </main>
    </> 
  );
}

function Header({ showForm, setShowForm }){
  const appTitle = '4Now';
  return(
    <header className="header">
        <div className="logo">
          <img src="logo.png"  alt="4Now Logo"/>
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
  const textLength = text.length;

  function handleSubmit(e){
    e.preventDefault();
    console.log(text, source, category);

    if(text && isValidHttpUrl(source) && category && textLength <= 200) console.log("valid data");

    const newFact = {
      id: Math.round(Math.random()*1000000),
      text,
      source,
      category,
      votesheart: 0,
      votesfrog: 0,
      votesno: 0,
      createdIn: new Date().getFullYear()
    };

    //add new fact to UI
    setFacts((facts) => [newFact, ...facts]);

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
          onChange={(e) => setText(e.target.value)}/>

      <span>{200 - textLength}</span>

        <input type="text"  value={source} placeholder="Trustworthy source..."
          onChange={(e) => setSource(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Choose Category:</option>
          {CATEGORIES.map((category) => (
            <option key={category.name} value ={category.name}>
              {category.name.toUpperCase()}
            </option>
          ))}
        </select>
        <button className="btn btn-large">Post</button>
  </form>
  );
}

function CategoryFilter(){
  return <aside>
    <ul>
      <li className="category">
          <button className="btn btn-all">All</button>
      </li>
      {CATEGORIES.map((category) => 
        <li key={category.name} className="category">
          <button className="btn btn-category" 
            style={{backgroundColor: category.color}}>
            {category.name}
          </button>
      </li>)}
    </ul>
  </aside>;
}

function FactList({ facts }){
  return (
  <section>
    <ul className="facts-list">{
      facts.map((fact) => 
        <Fact key={fact.id} fact={fact}/>
      )}
    </ul>
    <p>There are {facts.length} facts in the database. Add your own!</p>
  </section>
  )}

function Fact({ fact }){
  return (
    <li className="fact">
    <p>{fact.text} 
        <a className="source" href={fact.source} target="_blank"> (Source)</a> 
    </p>
    <span className="tag" style={{
          backgroundColor: CATEGORIES.find((category) => 
          category.name === fact.category).color
          }}>{fact.category}
    </span>
    <div className="vote-buttons">
        <button>💗 {fact.votesheart}</button>
        <button>🐸 {fact.votesfrog}</button>
        <button>👿 {fact.votesno}</button>
    </div>
  </li>
)}

export default App;
