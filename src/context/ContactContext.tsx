import { createContext, useContext, useState, ReactNode } from "react";

// ============== Types ==============
export type ContactType = "change-request" | "consultation" | "general";
type ContactStatus = "new" | "read";

export interface ContactSubmission {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    status: ContactStatus;
    type: ContactType;
    bookingId?: number;
    tourTitle?: string;
    replies: ContactReply[];
}

interface ContactReply {
    id: number;
    message: string;
    date: string;
    isAdmin: boolean;
}

interface ContactContextType {
    contacts: ContactSubmission[];
    submitContactRequest: (data: {
        name: string;
        email: string;
        subject: string;
        message: string;
        type: ContactType;
        bookingId?: number;
        tourTitle?: string;
    }) => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: ReactNode }) {
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);

    const submitContactRequest = async (data: {
        name: string;
        email: string;
        subject: string;
        message: string;
        type: ContactType;
        bookingId?: number;
        tourTitle?: string;
    }) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newContact: ContactSubmission = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            date: new Date().toISOString(),
            status: "new",
            type: data.type,
            bookingId: data.bookingId,
            tourTitle: data.tourTitle,
            replies: [],
        };

        setContacts((prev) => [newContact, ...prev]);
    };

    return (
        <ContactContext.Provider value={{ contacts, submitContactRequest }}>
            {children}
        </ContactContext.Provider>
    );
}

export function useContact() {
    const context = useContext(ContactContext);
    if (context === undefined) {
        throw new Error("useContact must be used within a ContactProvider");
    }
    return context;
}
