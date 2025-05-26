import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', public: true },
  { name: 'Dashboard', href: '/dashboard', public: false },
  { name: 'Transaction History', href: '/transactions', public: false },
  { name: 'New Transaction', href: '/transactions/new', public: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Layout = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-full bg-gray-50 flex flex-col">
      <Disclosure as="nav" className="bg-primary-700 w-full">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link to="/" className="text-white font-bold text-xl">
                      Random Bank
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation
                        .filter(item => item.public || isAuthenticated)
                        .map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={classNames(
                              item.href === window.location.pathname
                                ? 'bg-primary-800 text-white'
                                : 'text-white hover:bg-primary-600',
                              'rounded-md px-3 py-2 text-sm font-medium'
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    {isAuthenticated ? (
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-primary-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700">
                            <span className="sr-only">Open user menu</span>
                            <UserCircleIcon className="h-8 w-8 rounded-full" />
                          </Menu.Button>
                        </div>
                        <Transition
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              {({ active }) => (
                                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                  <p className="font-medium">{currentUser?.username}</p>
                                  <p className="text-gray-500">{currentUser?.email}</p>
                                </div>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/profile"
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  Your Profile
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleLogout}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    ) : (
                      <div className="flex space-x-4">
                        <Link
                          to="/login"
                          className="text-white hover:bg-primary-600 rounded-md px-3 py-2 text-sm font-medium"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="bg-white text-primary-700 hover:bg-gray-100 rounded-md px-3 py-2 text-sm font-medium"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-primary-800 p-2 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation
                  .filter(item => item.public || isAuthenticated)
                  .map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.href === window.location.pathname
                          ? 'bg-primary-800 text-white'
                          : 'text-white hover:bg-primary-600',
                        'block rounded-md px-3 py-2 text-base font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
              </div>
              <div className="border-t border-primary-800 pb-3 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-1 px-2">
                    <div className="px-4 py-2 text-base font-medium text-white">
                      {currentUser?.username}
                    </div>
                    <div className="px-4 py-2 text-sm text-primary-200">
                      {currentUser?.email}
                    </div>
                    <Link
                      to="/profile"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-600"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-600"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 px-2">
                    <Link
                      to="/login"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-600"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="w-full">
        <Outlet />
      </main>
      
      <footer className="bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Random Bank. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
