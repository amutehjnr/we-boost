import Header from './Header';
import Hero from './Hero';
import Hero2 from './Hero2';
import Footer from './Footer';
import UserHome from './user-components/UserHome';

export default function Home({ handleLogout, user, isClient, userModeToggle }) {
  return (
    <>
      <div className="Home">
        <Header handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />
        {isClient ? (
          <>
            <div className='flex justify-between mx-5 p-5 mt-5 bg-slate-200 rounded-md'>
              <Hero user={user}/>
            </div>
            <Hero2 user={user} />
          </>
        ) : (
          <UserHome user={user} />
        )}
        <Footer isClient={isClient} />
      </div>
    </>
  );
}