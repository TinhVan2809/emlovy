type Users = {
  user_id: number;
  name: string;
  username: string;
};

type Props = {
  results: Users;
};
function SeatchResult({results}: Props) {
    return ( 
        <div className="" key={results.user_id}>
            <p>{results.user_id}</p>
            <p>{results.name}</p>
        </div>
     );
}

export default SeatchResult;