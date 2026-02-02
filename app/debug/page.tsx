'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function DebugPage() {
    const [logs, setLogs] = useState<string[]>([])
    const [userId, setUserId] = useState<string>('Loading...')

    const log = (msg: string, data?: any) => {
        const time = new Date().toLocaleTimeString()
        const text = typeof data !== 'undefined'
            ? `${msg} ${JSON.stringify(data, null, 2)}`
            : msg
        setLogs(prev => [`[${time}] ${text}`, ...prev])
    }

    const runDiagnostics = async () => {
        setLogs([])
        log('Starting diagnostics...')

        const supabase = createClient()

        // 1. Check Session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
            log('Session Error:', sessionError)
            return
        }

        if (!session) {
            log('No active session found.')
            setUserId('Not Logged In')
            return
        }

        const uid = session.user.id
        setUserId(uid)
        log('User ID:', uid)
        log('Email:', session.user.email)

        // 2. Fetch Classes with rigorous filter
        log('Attempting fetch: .from("classes").select("*").eq("user_id", uid)')
        const { data: classesEq, error: errEq } = await supabase
            .from('classes')
            .select('*')
            .eq('user_id', uid)

        if (errEq) log('Error fetching classes (eq):', errEq)
        else log(`Found ${classesEq?.length} classes matching user_id.`)

        // 3. Fetch Classes WITHOUT filter (to check RLS visibility)
        // If RLS works correctly, this should return the same as above.
        // If RLS is failing (blocking everything), this returns 0.
        // If RLS is OFF, this returns ALL classes.
        log('Attempting fetch: .from("classes").select("*") with limit 5')
        const { data: classesAll, error: errAll } = await supabase
            .from('classes')
            .select('*')
            .limit(5)

        if (errAll) log('Error fetching classes (all):', errAll)
        else {
            log(`Found ${classesAll?.length} visible classes (any owner).`)
            if (classesAll && classesAll.length > 0) {
                log('First visible class owner:', classesAll[0].user_id)
                if (classesAll[0].user_id !== uid) {
                    log('WARNING: Visible class does NOT belong to you.')
                }
            }
        }

        // 4. Try Creating a test class
        // log('Attempting to create "Debug Test Class"...')
        // const { data: newClass, error: createError } = await supabase
        //     .from('classes')
        //     .insert({ user_id: uid, name: 'Debug Test Class' })
        //     .select()
        // 
        // if (createError) log('Error creating class:', createError)
        // else log('Class created successfully:', newClass)
    }

    useEffect(() => {
        runDiagnostics()
    }, [])

    return (
        <div className="p-8 max-w-4xl mx-auto font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Supabase Diagnostics</h1>

            <div className="mb-6 p-4 bg-stone-100 rounded border">
                <p className="font-bold">Current User ID:</p>
                <p className="text-blue-600 break-all">{userId}</p>
                <button
                    onClick={runDiagnostics}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Re-run Diagnostics
                </button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-lg min-h-[400px] overflow-y-auto whitespace-pre-wrap">
                {logs.map((log, i) => (
                    <div key={i} className="mb-2 border-b border-green-900/30 pb-1">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    )
}
