import React, {createContext, ReactNode, useContext, useState} from "react";

type fakeAuthContextType = {
	id: number;
	setId: React.Dispatch<React.SetStateAction<number>>;
	role: string;
	setRole: React.Dispatch<React.SetStateAction<string>>;
	email: string;
	setEmail: React.Dispatch<React.SetStateAction<string>>;
	name: string;
	setName: React.Dispatch<React.SetStateAction<string>>;
	surname: string;
	setSurname: React.Dispatch<React.SetStateAction<string>>;

}

const fakeAuthContext = createContext<fakeAuthContextType | undefined>(undefined);

export const FakeAuthContextProvider = ({children}: {children: ReactNode } ) => {
	const [role, setRole] = useState<string>("admininstrator");
	const [email, setEmail] = useState<string>("mpesnik@ukc-maribor.si");
	const [name, setName] = useState<string>("Mirko");
	const [surname, setSurname] = useState<string>("Pesnik");
	const [id, setId] = useState<number>(1);
	return (
		<fakeAuthContext.Provider value={{role, setRole, email, setEmail, name, setName, surname, setSurname, id, setId}}>
			{children}
		</fakeAuthContext.Provider>
	)
}

const useFakeAuthContext = () => {
	const context = useContext(fakeAuthContext);
	if (!context) {
		throw new Error('useFakeAuthContext must be used within the fakeAuthContextProvider!');
	}
	return context;
}

export default useFakeAuthContext;
